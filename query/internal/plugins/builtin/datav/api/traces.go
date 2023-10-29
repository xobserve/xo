package api

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	datavmodels "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/models"
	datavutils "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/utils"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

func GetTraces(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	start, _ := strconv.ParseInt(c.Query("start"), 10, 64)
	end, _ := strconv.ParseInt(c.Query("end"), 10, 64)

	// @performace: 对 traceId 做 skip index
	traceIds := strings.TrimSpace(c.Query("traceIds"))

	var domainQuery string
	environment := datavutils.GetValueListFromParams(params, "environment")
	if environment != nil {
		domainQuery += fmt.Sprintf(" AND environment in ('%s')", strings.Join(environment, "','"))
	}
	service := datavutils.GetValueListFromParams(params, "service")
	if service != nil {
		domainQuery += fmt.Sprintf(" AND serviceName in ('%s')", strings.Join(environment, "','"))
	}

	var query string
	if traceIds != "" {
		query = fmt.Sprintf("SELECT timestamp,traceID,name,durationNano,responseStatusCode FROM signoz_traces.distributed_signoz_index_v2 WHERE traceID in ('%s') AND parentSpanID=''", strings.Join(strings.Split(traceIds, ","), "','"))
	} else {
		query = fmt.Sprintf("SELECT timestamp,traceID,name,durationNano,responseStatusCode FROM signoz_traces.distributed_signoz_index_v2 WHERE timestamp >= toDateTime(%d) AND timestamp <= toDateTime(%d) %s AND parentSpanID='' ORDER BY timestamp DESC limit 20", start, end, domainQuery)

	}
	// query traceIDs
	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		logger.Warn("Error Query trace ids", "query", query, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	traceIndexMap := make(map[string]*datavmodels.TraceIndex, 0)
	traceIDList := make([]string, 0)
	for rows.Next() {
		var traceIndex datavmodels.TraceIndex
		var timestamp time.Time
		err := rows.Scan(&timestamp, &traceIndex.TraceID, &traceIndex.TraceName, &traceIndex.Duration, &traceIndex.StatusCode)
		if err != nil {
			logger.Warn("Error scan trace index", "error", err)
			continue
		}
		traceIndex.StartTime = timestamp.UnixNano() / 1e3
		traceIndex.Duration = traceIndex.Duration / 1e3
		traceIndexMap[traceIndex.TraceID] = &traceIndex
		traceIDList = append(traceIDList, traceIndex.TraceID)
	}

	logger.Info("Query trace ids", "query", query)

	// query extra trace info
	query = fmt.Sprintf("select traceID,serviceName,hasError,count(spanID) from signoz_traces.signoz_index_v2 where traceID in ('%s') GROUP by traceID,serviceName,hasError", strings.Join(traceIDList, "','"))
	rows, err = conn.Query(c.Request.Context(), query)
	if err != nil {
		logger.Warn("Error Query logs", "query", query, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query traces extra info", "query", query)

	traceServicesMap := make(map[string]map[string]*datavmodels.TraceServiceIndex)
	for rows.Next() {
		var traceID, serviceName string
		var hasError bool
		var numSpans uint64
		err := rows.Scan(&traceID, &serviceName, &hasError, &numSpans)
		if err != nil {
			logger.Warn("Error scan trace index", "error", err)
			continue
		}
		trace, ok := traceServicesMap[traceID]
		if !ok {
			var s = &datavmodels.TraceServiceIndex{
				Name:     serviceName,
				NumSpans: numSpans,
				Errors:   0,
			}
			if hasError {
				s.Errors = numSpans
			}
			trace = map[string]*datavmodels.TraceServiceIndex{
				serviceName: s,
			}
			traceServicesMap[traceID] = trace
		} else {
			s, ok := trace[serviceName]
			if !ok {
				var s = &datavmodels.TraceServiceIndex{
					Name:     serviceName,
					NumSpans: numSpans,
					Errors:   0,
				}
				if hasError {
					s.Errors = numSpans
				}
				trace[serviceName] = s
			} else {
				s.NumSpans += numSpans
				if hasError {
					s.Errors += numSpans
				}
			}
		}
	}

	for traceID, serviceMap := range traceServicesMap {
		traceIndex, ok := traceIndexMap[traceID]
		if ok {
			traceIndex.Services = make([]*datavmodels.TraceServiceIndex, 0)
			for _, service := range serviceMap {
				traceIndex.Services = append(traceIndex.Services, service)
			}
		}
	}

	traceIndexes := make([]*datavmodels.TraceIndex, 0)
	for _, traceIndex := range traceIndexMap {
		traceIndexes = append(traceIndexes, traceIndex)
	}

	var res1 *models.PluginResultData
	if traceIds == "" {
		// // query metrics
		// metricsQuery := fmt.Sprintf("SELECT toStartOfInterval(fromUnixTimestamp64Nano(timestamp), INTERVAL %d SECOND) AS ts_bucket, if(multiSearchAny(severity, ['error', 'err', 'emerg', 'alert', 'crit', 'fatal']), 'errors', 'others') as severity_group, count(*) as count from %s.%s where (timestamp >= ? AND timestamp <= ? %s %s) group by ts_bucket,severity_group order by ts_bucket", step, config.Data.Observability.DefaultLogDB, datavmodels.DefaultLogsTable, domainQuery, searchQuery)

		// rows, err = conn.Query(c.Request.Context(), metricsQuery, args...)
		// if err != nil {
		// 	logger.Warn("Error Query log metrics", "query", metricsQuery, "error", err)
		// 	return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		// }
		// defer rows.Close()

		// logger.Info("Query log metrics", "query", metricsQuery)

		// res1, err = pluginUtils.ConvertDbRowsToPluginData(rows)
		// if err != nil {
		// 	return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		// }
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", map[string]interface{}{
		"traces": traceIndexes,
		"chart":  res1,
	})
}

func GetTrace(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	return models.GenPluginResult(models.PluginStatusSuccess, "", nil)
}
