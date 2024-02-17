// Copyright 2017, 2018 Percona LLC
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

// Package clickhousemetricsexporter provides writer for ClickHouse storage.
package clickhousemetricsexporter

import (
	"context"
	"fmt"
	"net/url"
	"runtime/pprof"
	"strings"
	"sync"
	"time"

	clickhouse "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/common/model"
	"github.com/sirupsen/logrus"
	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/pdata/pmetric"
	semconv "go.opentelemetry.io/collector/semconv/v1.13.0"

	"github.com/prometheus/prometheus/prompb"
	"github.com/xObserve/xObserve/otel-collector/exporter/clickhousemetricsexporter/base"
	"github.com/xObserve/xObserve/otel-collector/exporter/clickhousemetricsexporter/utils/timeseries"
	"github.com/xObserve/xObserve/otel-collector/pkg/usage"
)

const (
	namespace                     = "promhouse"
	subsystem                     = "clickhouse"
	nameLabel                     = "__name__"
	CLUSTER                       = "cluster"
	DISTRIBUTED_TIME_SERIES_TABLE = "distributed_time_series"
	DISTRIBUTED_SAMPLES_TABLE     = "distributed_samples"
	temporalityLabel              = "__temporality__"
	envLabel                      = "environment"
)

// clickHouse implements storage interface for the ClickHouse.
type clickHouse struct {
	conn                 clickhouse.Conn
	l                    *logrus.Entry
	database             string
	maxTimeSeriesInQuery int

	timeSeriesRW sync.RWMutex
	// Maintains the lookup map for fingerprints that are
	// written to time series table. This map is used to eliminate the
	// unnecessary writes to table for the records that already exist.
	timeSeries      map[uint64]struct{}
	prevShardCount  uint64
	watcherInterval time.Duration

	mWrittenTimeSeries prometheus.Counter
}

type ClickHouseParams struct {
	DSN                  string
	DropDatabase         bool
	MaxOpenConns         int
	MaxTimeSeriesInQuery int
	WatcherInterval      time.Duration
}

func NewClickHouse(params *ClickHouseParams) (base.Storage, error) {
	l := logrus.WithField("component", "clickhouse")

	dsnURL, err := url.Parse(params.DSN)

	if err != nil {
		return nil, err
	}
	database := dsnURL.Query().Get("database")
	if database == "" {
		return nil, fmt.Errorf("database should be set in ClickHouse DSN")
	}

	options := &clickhouse.Options{
		Addr: []string{dsnURL.Host},
	}
	if dsnURL.Query().Get("username") != "" {
		auth := clickhouse.Auth{
			// Database: "",
			Username: dsnURL.Query().Get("username"),
			Password: dsnURL.Query().Get("password"),
		}

		options.Auth = auth
	}
	conn, err := clickhouse.Open(options)
	if err != nil {
		return nil, fmt.Errorf("could not connect to clickhouse: %s", err)
	}

	ch := &clickHouse{
		conn:                 conn,
		l:                    l,
		database:             database,
		maxTimeSeriesInQuery: params.MaxTimeSeriesInQuery,

		timeSeries: make(map[uint64]struct{}, 8192),

		mWrittenTimeSeries: prometheus.NewCounter(prometheus.CounterOpts{
			Namespace: namespace,
			Subsystem: subsystem,
			Name:      "written_time_series",
			Help:      "Number of written time series.",
		}),
		watcherInterval: params.WatcherInterval,
	}

	go func() {
		ctx := pprof.WithLabels(context.TODO(), pprof.Labels("component", "clickhouse_reloader"))
		pprof.SetGoroutineLabels(ctx)
		ch.shardCountWatcher(ctx)
	}()

	return ch, nil
}

func (ch *clickHouse) shardCountWatcher(ctx context.Context) {
	ticker := time.NewTicker(ch.watcherInterval)
	defer ticker.Stop()

	q := `SELECT count() FROM system.clusters WHERE cluster='cluster'`
	for {

		err := func() error {
			ch.l.Debug(q)
			row := ch.conn.QueryRow(ctx, q)
			if row.Err() != nil {
				return row.Err()
			}

			var shardCount uint64
			err := row.Scan(&shardCount)
			if err != nil {
				return err
			}

			ch.timeSeriesRW.Lock()
			if ch.prevShardCount != shardCount {
				ch.l.Infof("Shard count changed from %d to %d. Resetting time series map.", ch.prevShardCount, shardCount)
				ch.timeSeries = make(map[uint64]struct{})
			}
			ch.prevShardCount = shardCount
			ch.timeSeriesRW.Unlock()
			return nil
		}()
		if err != nil {
			ch.l.Error(err)
		}

		select {
		case <-ctx.Done():
			ch.l.Warn(ctx.Err())
			return
		case <-ticker.C:
		}
	}
}

func (ch *clickHouse) Describe(c chan<- *prometheus.Desc) {
	ch.mWrittenTimeSeries.Describe(c)
}

func (ch *clickHouse) Collect(c chan<- prometheus.Metric) {
	ch.mWrittenTimeSeries.Collect(c)
}

func (ch *clickHouse) GetDBConn() interface{} {
	return ch.conn
}

func (ch *clickHouse) Write(ctx context.Context, data *prompb.WriteRequest, metricNameToTemporality map[string]pmetric.AggregationTemporality) error {
	// calculate fingerprints, map them to time series
	fingerprints := make([]uint64, len(data.Timeseries))
	timeSeries := make(map[uint64][]*prompb.Label, len(data.Timeseries))
	fingerprintToName := make(map[uint64]map[string]string)

	for i, ts := range data.Timeseries {
		var metricName string
		var env string = "default"
		labelsOverridden := make(map[string]*prompb.Label)
		for _, label := range ts.Labels {
			labelsOverridden[label.Name] = &prompb.Label{
				Name:  label.Name,
				Value: label.Value,
			}
			if label.Name == nameLabel {
				metricName = label.Value
			}
			if label.Name == semconv.AttributeDeploymentEnvironment || label.Name == sanitize(semconv.AttributeDeploymentEnvironment) {
				env = label.Value
			}
		}
		var labels []*prompb.Label
		for _, l := range labelsOverridden {
			labels = append(labels, l)
		}
		// add temporality label
		if metricName != "" {
			if t, ok := metricNameToTemporality[metricName]; ok {
				labels = append(labels, &prompb.Label{
					Name:  temporalityLabel,
					Value: t.String(),
				})
			}
		}
		timeseries.SortLabels(labels)
		f := timeseries.Fingerprint(labels)
		fingerprints[i] = f
		timeSeries[f] = labels
		if _, ok := fingerprintToName[f]; !ok {
			fingerprintToName[f] = make(map[string]string)
		}
		fingerprintToName[f][nameLabel] = metricName
		fingerprintToName[f][env] = env
	}
	if len(fingerprints) != len(timeSeries) {
		ch.l.Debugf("got %d fingerprints, but only %d of them were unique time series", len(fingerprints), len(timeSeries))
	}

	// find new time series
	newTimeSeries := make(map[uint64][]*prompb.Label)
	ch.timeSeriesRW.Lock()
	for f, m := range timeSeries {
		_, ok := ch.timeSeries[f]
		if !ok {
			ch.timeSeries[f] = struct{}{}
			newTimeSeries[f] = m
		}
	}
	ch.timeSeriesRW.Unlock()

	// err := func() error {
	// 	ctx := context.Background()
	// 	err := ch.conn.Exec(ctx, `SET allow_experimental_object_type = 1`)
	// 	if err != nil {
	// 		return err
	// 	}

	// 	statement, err := ch.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s.%s (metric_name, temporality, timestamp_ms, fingerprint, labels) VALUES (?, ?, ?, ?)", ch.database, DISTRIBUTED_TIME_SERIES_TABLE))
	// 	if err != nil {
	// 		return err
	// 	}
	// 	timestamp := model.Now().Time().UnixMilli()
	// 	for fingerprint, labels := range newTimeSeries {
	// 		encodedLabels := string(marshalLabels(labels, make([]byte, 0, 128)))
	// 		err = statement.Append(
	// 			fingerprintToName[fingerprint][nameLabel],
	// 			metricNameToTemporality[fingerprintToName[fingerprint][nameLabel]].String(),
	// 			timestamp,
	// 			fingerprint,
	// 			encodedLabels,
	// 		)
	// 		if err != nil {
	// 			return err
	// 		}
	// 	}

	// 	start := time.Now()
	// 	err = statement.Send()
	// 	ctx, _ = tag.New(ctx,
	// 		tag.Upsert(exporterKey, string(component.DataTypeMetrics)),
	// 		tag.Upsert(tableKey, DISTRIBUTED_TIME_SERIES_TABLE),
	// 	)
	// 	stats.Record(ctx, writeLatencyMillis.M(int64(time.Since(start).Milliseconds())))
	// 	return err
	// }()

	// if err != nil {
	// 	return err
	// }

	// Write to time_series_v3 table
	err := func() error {
		ctx := context.Background()
		err := ch.conn.Exec(ctx, `SET allow_experimental_object_type = 1`)
		if err != nil {
			return err
		}

		statement, err := ch.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s.%s (environment, temporality, metric_name, fingerprint, timestamp_ms, labels) VALUES (?, ?, ?, ?, ?, ?)", ch.database, DISTRIBUTED_TIME_SERIES_TABLE))
		if err != nil {
			return err
		}
		timestamp := model.Now().Time().UnixMilli()
		for fingerprint, labels := range newTimeSeries {
			encodedLabels := string(marshalLabels(labels, make([]byte, 0, 128)))
			err = statement.Append(
				fingerprintToName[fingerprint][envLabel],
				metricNameToTemporality[fingerprintToName[fingerprint][nameLabel]].String(),
				fingerprintToName[fingerprint][nameLabel],
				fingerprint,
				timestamp,
				encodedLabels,
			)
			if err != nil {
				return err
			}
		}

		start := time.Now()
		err = statement.Send()
		ctx, _ = tag.New(ctx,
			tag.Upsert(exporterKey, string(component.DataTypeMetrics)),
			tag.Upsert(tableKey, DISTRIBUTED_TIME_SERIES_TABLE),
		)
		stats.Record(ctx, writeLatencyMillis.M(int64(time.Since(start).Milliseconds())))
		return err
	}()

	if err != nil {
		return err
	}

	metrics := map[string]usage.Metric{}
	err = func() error {
		ctx := context.Background()

		statement, err := ch.conn.PrepareBatch(ctx, fmt.Sprintf("INSERT INTO %s.%s", ch.database, DISTRIBUTED_SAMPLES_TABLE))
		if err != nil {
			return err
		}

		for i, ts := range data.Timeseries {
			fingerprint := fingerprints[i]
			for _, s := range ts.Samples {

				// usage collection checks
				tenant := "1"
				collectUsage := true
				for _, val := range timeSeries[fingerprint] {
					if val.Name == nameLabel && strings.HasPrefix(val.Value, "xobserve_") {
						collectUsage = false
						break
					}
					if val.Name == "teamId" {
						tenant = val.Value
					}
				}

				if collectUsage {
					usage.AddMetric(metrics, tenant, 1, int64(len(s.String())))
				}

				err = statement.Append(
					fingerprintToName[fingerprint][nameLabel],
					fingerprint,
					s.Timestamp,
					s.Value,
				)
				if err != nil {
					return err
				}
			}
		}
		start := time.Now()
		err = statement.Send()
		ctx, _ = tag.New(ctx,
			tag.Upsert(exporterKey, string(component.DataTypeMetrics)),
			tag.Upsert(tableKey, DISTRIBUTED_SAMPLES_TABLE),
		)
		stats.Record(ctx, writeLatencyMillis.M(int64(time.Since(start).Milliseconds())))
		return err
	}()
	if err != nil {
		return err
	}

	for k, v := range metrics {
		stats.RecordWithTags(ctx, []tag.Mutator{tag.Upsert(usage.TagTenantKey, k)}, ExporterSentMetricPoints.M(int64(v.Count)), ExporterSentMetricPointsBytes.M(int64(v.Size)))
	}

	n := len(newTimeSeries)
	if n != 0 {
		ch.mWrittenTimeSeries.Add(float64(n))
		ch.l.Debugf("Wrote %d new time series.", n)
	}
	return nil
}

// check interfaces
var (
	_ base.Storage = (*clickHouse)(nil)
)
