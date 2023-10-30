// Copyright 2020, OpenTelemetry Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package clickhouselogsexporter

import (
	"context"

	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	driver "github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/DataObserve/datav/otel-collector/pkg/usage"
	"github.com/DataObserve/datav/otel-collector/pkg/utils"
	"github.com/segmentio/ksuid"
	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/plog"
	"go.uber.org/zap"
)

const (
	CLUSTER                    = "cluster"
	DISTRIBUTED_LOGS_TABLE     = "distributed_logs"
	DISTRIBUTED_TAG_ATTRIBUTES = "distributed_tag_attributes"
)

type clickhouseLogsExporter struct {
	db            clickhouse.Conn
	insertLogsSQL string
	ksuid         ksuid.KSUID

	logger *zap.Logger
	cfg    *Config

	usageCollector *usage.UsageCollector

	wg        *sync.WaitGroup
	closeChan chan struct{}
}

func newExporter(logger *zap.Logger, cfg *Config) (*clickhouseLogsExporter, error) {
	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	client, err := newClickhouseClient(logger, cfg)
	if err != nil {
		return nil, err
	}

	insertLogsSQL := renderInsertLogsSQL(cfg)

	collector := usage.NewUsageCollector(
		client,
		usage.Options{
			ReportingInterval: usage.DefaultCollectionInterval,
		},
		"signoz_logs",
		UsageExporter,
	)
	if err != nil {
		log.Fatalf("Error creating usage collector for logs : %v", err)
	}

	collector.Start()

	// view should be registered after exporter is initialized
	if err := view.Register(LogsCountView, LogsSizeView); err != nil {
		return nil, err
	}

	return &clickhouseLogsExporter{
		db:             client,
		insertLogsSQL:  insertLogsSQL,
		logger:         logger,
		cfg:            cfg,
		ksuid:          ksuid.New(),
		usageCollector: collector,
		wg:             new(sync.WaitGroup),
		closeChan:      make(chan struct{}),
	}, nil
}

// Shutdown will shutdown the exporter.
func (e *clickhouseLogsExporter) Shutdown(_ context.Context) error {
	close(e.closeChan)
	e.wg.Wait()
	if e.usageCollector != nil {
		e.usageCollector.Stop()
	}
	if e.db != nil {
		err := e.db.Close()
		if err != nil {
			return err
		}
	}
	return nil
}

func (e *clickhouseLogsExporter) pushLogsData(ctx context.Context, ld plog.Logs) error {
	e.wg.Add(1)
	defer e.wg.Done()

	select {
	case <-e.closeChan:
		return errors.New("shutdown has been called")
	default:
		start := time.Now()
		statement, err := e.db.PrepareBatch(ctx, e.insertLogsSQL)
		if err != nil {
			return fmt.Errorf("PrepareBatch:%w", err)
		}

		tagStatement, err := e.db.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s.%s", databaseName, DISTRIBUTED_TAG_ATTRIBUTES))
		if err != nil {
			return fmt.Errorf("PrepareTagBatch:%w", err)
		}

		defer func() {
			_ = statement.Abort()
			_ = tagStatement.Abort()
		}()

		metrics := map[string]usage.Metric{}

		for i := 0; i < ld.ResourceLogs().Len(); i++ {
			logs := ld.ResourceLogs().At(i)
			res := logs.Resource()
			resBytes, _ := json.Marshal(res.Attributes().AsRaw())

			resources := attributesToSlice(res.Attributes(), true)
			err := addAttrsToTagStatement(tagStatement, "resource", resources)
			if err != nil {
				return err
			}
			for j := 0; j < logs.ScopeLogs().Len(); j++ {
				rs := logs.ScopeLogs().At(j).LogRecords()
				for k := 0; k < rs.Len(); k++ {
					r := rs.At(k)

					// capturing the metrics
					tenant := utils.GetTenantNameFromResource(logs.Resource())
					attrBytes, _ := json.Marshal(r.Attributes().AsRaw())
					usage.AddMetric(metrics, tenant, 1, int64(len([]byte(r.Body().AsString()))+len(attrBytes)+len(resBytes)))

					// set observedTimestamp as the default timestamp if timestamp is empty.
					ts := uint64(r.Timestamp())
					ots := uint64(r.ObservedTimestamp())
					if ots == 0 {
						ots = uint64(time.Now().UnixNano())
					}
					if ts == 0 {
						ts = ots
					}

					attributes := attributesToSlice(r.Attributes(), false)
					err := addAttrsToTagStatement(tagStatement, "tag", attributes)
					if err != nil {
						return err
					}
					namespace, _ := res.Attributes().Get("namespace")
					service, _ := res.Attributes().Get("service_name")
					host, _ := res.Attributes().Get("host_name")

					err = statement.Append(
						ts,
						ots,
						e.ksuid.String(),
						utils.TraceIDToHexOrEmptyString(r.TraceID()),
						utils.SpanIDToHexOrEmptyString(r.SpanID()),
						uint32(r.Flags()),
						strings.ToLower(r.SeverityText()),
						uint8(r.SeverityNumber()),
						getStringifiedBody(r.Body()),
						resources.StringKeys,
						resources.StringValues,
						attributes.StringKeys,
						attributes.StringValues,
						attributes.IntKeys,
						attributes.IntValues,
						attributes.FloatKeys,
						attributes.FloatValues,
						namespace.AsString(),
						service.AsString(),
						host.AsString(),
					)
					if err != nil {
						return fmt.Errorf("StatementAppend:%w", err)
					}
					e.ksuid = e.ksuid.Next()
				}
			}
		}
		dbWriteStart := time.Now()
		err = statement.Send()
		stats.RecordWithTags(ctx,
			[]tag.Mutator{
				tag.Upsert(exporterKey, string(component.DataTypeLogs)),
				tag.Upsert(tableKey, DISTRIBUTED_LOGS_TABLE),
			},
			writeLatencyMillis.M(int64(time.Since(dbWriteStart).Milliseconds())),
		)
		if err != nil {
			return fmt.Errorf("StatementSend:%w", err)
		}
		duration := time.Since(start)
		e.logger.Debug("insert logs", zap.Int("records", ld.LogRecordCount()),
			zap.String("cost", duration.String()))

		for k, v := range metrics {
			stats.RecordWithTags(ctx, []tag.Mutator{tag.Upsert(usage.TagTenantKey, k)}, ExporterSigNozSentLogRecords.M(int64(v.Count)), ExporterSigNozSentLogRecordsBytes.M(int64(v.Size)))
		}

		// push tag attributes
		tagWriteStart := time.Now()
		err = tagStatement.Send()
		stats.RecordWithTags(ctx,
			[]tag.Mutator{
				tag.Upsert(exporterKey, string(component.DataTypeLogs)),
				tag.Upsert(tableKey, DISTRIBUTED_TAG_ATTRIBUTES),
			},
			writeLatencyMillis.M(int64(time.Since(tagWriteStart).Milliseconds())),
		)
		if err != nil {
			return err
		}

		return err
	}
}

type attributesToSliceResponse struct {
	StringKeys   []string
	StringValues []string
	IntKeys      []string
	IntValues    []int64
	FloatKeys    []string
	FloatValues  []float64
	BoolKeys     []string
}

func getStringifiedBody(body pcommon.Value) string {
	var strBody string
	switch body.Type() {
	case pcommon.ValueTypeBytes:
		strBody = string(body.Bytes().AsRaw())
	default:
		strBody = body.AsString()
	}
	return strBody
}

func addAttrsToTagStatement(statement driver.Batch, tagType string, attrs attributesToSliceResponse) error {
	for i, v := range attrs.StringKeys {
		err := statement.Append(
			time.Now(),
			v,
			tagType,
			"string",
			attrs.StringValues[i],
			nil,
			nil,
		)
		if err != nil {
			return fmt.Errorf("could not append string attribute to batch, err: %s", err)
		}
	}
	for i, v := range attrs.IntKeys {
		err := statement.Append(
			time.Now(),
			v,
			tagType,
			"int64",
			nil,
			attrs.IntValues[i],
			nil,
		)
		if err != nil {
			return fmt.Errorf("could not append number attribute to batch, err: %s", err)
		}
	}
	for i, v := range attrs.FloatKeys {
		err := statement.Append(
			time.Now(),
			v,
			tagType,
			"float64",
			nil,
			nil,
			attrs.FloatValues[i],
		)
		if err != nil {
			return fmt.Errorf("could not append number attribute to batch, err: %s", err)
		}
	}
	for _, v := range attrs.BoolKeys {
		err := statement.Append(
			time.Now(),
			v,
			tagType,
			"bool",
			nil,
			nil,
			nil,
		)
		if err != nil {
			return fmt.Errorf("could not append bool attribute to batch, err: %s", err)
		}
	}
	return nil
}

func attributesToSlice(attributes pcommon.Map, forceStringValues bool) (response attributesToSliceResponse) {
	attributes.Range(func(k string, v pcommon.Value) bool {
		if forceStringValues {
			// store everything as string
			response.StringKeys = append(response.StringKeys, formatKey(k))
			response.StringValues = append(response.StringValues, v.AsString())
		} else {
			switch v.Type() {
			case pcommon.ValueTypeInt:
				response.IntKeys = append(response.IntKeys, formatKey(k))
				response.IntValues = append(response.IntValues, v.Int())
			case pcommon.ValueTypeDouble:
				response.FloatKeys = append(response.FloatKeys, formatKey(k))
				response.FloatValues = append(response.FloatValues, v.Double())
			case pcommon.ValueTypeBool:
				// add boolValues in future if it is required
				response.BoolKeys = append(response.BoolKeys, formatKey(k))
			default: // store it as string
				response.StringKeys = append(response.StringKeys, formatKey(k))
				response.StringValues = append(response.StringValues, v.AsString())
			}
		}
		return true
	})
	return response
}

func formatKey(k string) string {
	return strings.ReplaceAll(k, ".", "_")
}

const (
	// language=ClickHouse SQL
	insertLogsSQLTemplate = `INSERT INTO %s.%s (
							timestamp,
							observed_timestamp,
							id,
							trace_id,
							span_id,
							trace_flags,
							severity,
							severity_number,
							body,
							resources_string_key,
							resources_string_value,
							attributes_string_key, 
							attributes_string_value,
							attributes_int64_key,
							attributes_int64_value,
							attributes_float64_key,
							attributes_float64_value,
							namespace,
							service,
							host
							) VALUES (
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?,
								?
								)`
)

// newClickhouseClient create a clickhouse client.
func newClickhouseClient(logger *zap.Logger, cfg *Config) (clickhouse.Conn, error) {
	// use empty database to create database
	ctx := context.Background()
	dsnURL, err := url.Parse(cfg.DSN)
	if err != nil {
		return nil, err
	}
	options := &clickhouse.Options{
		Addr: []string{dsnURL.Host},
	}
	if dsnURL.Query().Get("username") != "" {
		auth := clickhouse.Auth{
			Username: dsnURL.Query().Get("username"),
			Password: dsnURL.Query().Get("password"),
		}
		options.Auth = auth
	}
	db, err := clickhouse.Open(options)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(ctx); err != nil {
		return nil, err
	}
	return db, nil
}

func renderInsertLogsSQL(cfg *Config) string {
	return fmt.Sprintf(insertLogsSQLTemplate, databaseName, DISTRIBUTED_LOGS_TABLE)
}
