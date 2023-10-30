package api

import (
	"fmt"
	"strconv"
	"strings"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	datavmodels "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/models"
	datavutils "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/utils"
	pluginUtils "github.com/DataObserve/datav/query/internal/plugins/utils"
	"github.com/DataObserve/datav/query/pkg/config"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

func GetTraces(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	start, _ := strconv.ParseInt(c.Query("start"), 10, 64)
	end, _ := strconv.ParseInt(c.Query("end"), 10, 64)
	step, _ := strconv.ParseInt(c.Query("step"), 10, 64)

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
		query = fmt.Sprintf("SELECT startTime,traceId,name,duration,responseStatusCode FROM signoz_traces.distributed_signoz_index_v2 WHERE traceId in ('%s') AND parentId=''", strings.Join(strings.Split(traceIds, ","), "','"))
	} else {
		query = fmt.Sprintf("SELECT startTime,traceId,name,duration,responseStatusCode FROM signoz_traces.distributed_signoz_index_v2 WHERE startTime >= %d AND startTime <= %d %s AND parentId='' ORDER BY startTime DESC limit 20", start*1e9, end*1e9, domainQuery)

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
		err := rows.Scan(&traceIndex.StartTime, &traceIndex.TraceId, &traceIndex.TraceName, &traceIndex.Duration, &traceIndex.RespStatusCode)
		if err != nil {
			logger.Warn("Error scan trace index", "error", err)
			continue
		}
		traceIndex.StartTime = traceIndex.StartTime / 1e3
		traceIndex.Duration = traceIndex.Duration / 1e3
		traceIndexMap[traceIndex.TraceId] = &traceIndex
		traceIDList = append(traceIDList, traceIndex.TraceId)
	}

	logger.Info("Query trace ids", "query", query)

	// query extra trace info
	query = fmt.Sprintf("select traceId,serviceName,hasError,count(spanId) from signoz_traces.signoz_index_v2 where traceId in ('%s') GROUP by traceId,serviceName,hasError", strings.Join(traceIDList, "','"))
	rows, err = conn.Query(c.Request.Context(), query)
	if err != nil {
		logger.Warn("Error Query logs", "query", query, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query traces extra info", "query", query)

	traceServicesMap := make(map[string]map[string]*datavmodels.TraceServiceIndex)
	for rows.Next() {
		var traceId, serviceName string
		var hasError bool
		var numSpans uint64
		err := rows.Scan(&traceId, &serviceName, &hasError, &numSpans)
		if err != nil {
			logger.Warn("Error scan trace index", "error", err)
			continue
		}
		trace, ok := traceServicesMap[traceId]
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
			traceServicesMap[traceId] = trace
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
		// query metrics
		metricsQuery := fmt.Sprintf("SELECT toStartOfInterval(fromUnixTimestamp64Nano(startTime), INTERVAL %d SECOND) AS ts_bucket, hasError, count(DISTINCT traceId) as count from %s.%s where (startTime >= %d AND startTime <= %d %s) group by ts_bucket,hasError order by ts_bucket", step, config.Data.Observability.DefaultTraceDB, datavmodels.DefaultIndexTable, start*1e9, end*1e9, domainQuery)

		rows, err = conn.Query(c.Request.Context(), metricsQuery)
		if err != nil {
			logger.Warn("Error Query log metrics", "query", metricsQuery, "error", err)
			return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		}
		defer rows.Close()

		logger.Info("Query log metrics", "query", metricsQuery)

		res1, err = pluginUtils.ConvertDbRowsToPluginData(rows)
		if err != nil {
			return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		}
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", map[string]interface{}{
		"traces": traceIndexes,
		"chart":  res1,
	})
}

func GetTrace(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	traceID := strings.TrimSpace(c.Query("traceId"))

	query := fmt.Sprintf("SELECT startTime, traceId, model FROM signoz_traces.distributed_signoz_spans WHERE traceId='%s'", traceID)
	// query traceIDs
	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		logger.Warn("Error Query trace ids", "query", query, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query trace detail", "query", query)

	res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
	if err != nil {
		logger.Warn("Error conver rows to data", "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", res)
}
