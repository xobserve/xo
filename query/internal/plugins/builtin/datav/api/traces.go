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
	onlyChart := c.Query("onlyChart")
	aggregate := c.Query("aggregate")
	groupby := c.Query("groupby")
	operation := c.Query("operation")
	limit, _ := strconv.ParseInt(c.Query("limit"), 10, 64)
	min, _ := strconv.ParseInt(c.Query("min"), 10, 64)
	max, _ := strconv.ParseInt(c.Query("max"), 10, 64)

	// @performace: 对 traceId 做 skip index
	traceIds := strings.TrimSpace(c.Query("traceIds"))

	tenant := models.GetTenant(c)
	domainQuery := datavutils.BuildBasicDomainQuery(tenant, params)

	service0 := c.Query("service")
	var service string
	if service0 == "" {
		service = datavutils.GetValueFromParams(params, "service")
	} else {
		service = service0
	}

	if service == "" {
		return models.GenPluginResult(models.PluginStatusError, "service can not be empty", nil)
	}

	domainQuery += fmt.Sprintf(" AND serviceName='%s'", service)

	var operationNameQuery string
	var operationNameQuery1 string
	if operation == "" || operation == models.VarialbeAllOption {
		if min > 0 || max > 0 {
			query := fmt.Sprintf("select name from %s.%s where %s", config.Data.Observability.DefaultTraceDB, datavmodels.DefaultTopLevelOperationsTable, domainQuery)
			operationNameQuery = fmt.Sprintf(" AND name in (%s)", query)
		}

	} else {
		operationNameQuery = fmt.Sprintf(" AND name='%s'", operation)
		operationNameQuery1 = operationNameQuery
	}

	if min != 0 {
		domainQuery += fmt.Sprintf(" AND duration >= %d", min*1e6)
	}
	if max != 0 {
		domainQuery += fmt.Sprintf(" AND duration <= %d", max*1e6)
	}

	traceIndexes := make([]*datavmodels.TraceIndex, 0)

	if onlyChart != "true" {
		var query string
		if traceIds != "" {
			query = fmt.Sprintf("SELECT startTime as ts,serviceName,name,traceId, duration as maxDuration FROM %s.%s WHERE traceId in ('%s') AND parentId=''", config.Data.Observability.DefaultTraceDB, datavmodels.DefaultTraceIndexTable, strings.Join(strings.Split(traceIds, ","), "','"))
		} else if service != "" {
			// SELECT traceId,min(startTime) as ts,count(spanId) as spanCount,max(duration) as maxDuration FROM trace_index WHERE startTime >= 1698975125000000000 AND startTime <= 1698975420000000000 AND serviceName='customer' GROUP BY traceId ORDER BY maxDuration DESC LIMIT 20
			query = fmt.Sprintf("SELECT min(startTime) as ts,serviceName,name,traceId,max(duration) as maxDuration FROM %s.%s WHERE startTime >= %d AND startTime <= %d AND %s GROUP BY serviceName,name,traceId ORDER BY ts DESC limit %d", config.Data.Observability.DefaultTraceDB, datavmodels.DefaultTraceIndexTable, start*1e9, end*1e9, domainQuery+operationNameQuery, limit)
		} else {
			query = fmt.Sprintf("SELECT startTime as ts,serviceName,name,traceId, duration as maxDuration FROM %s.%s WHERE tartTime >= %d AND startTime <= %d AND %s  AND parentId='' ORDER BY ts DESC limit %d", config.Data.Observability.DefaultTraceDB, datavmodels.DefaultTraceIndexTable, start*1e9, end*1e9, domainQuery, limit)
		}
		// query traceIDs
		rows, err := conn.Query(c.Request.Context(), query)
		if err != nil {
			logger.Warn("Error Query trace ids", "query", query, "error", err)
			return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		}
		defer rows.Close()

		logger.Info("Query trace index", "query", query)

		traceIndexMap0 := make(map[string][]*datavmodels.TraceIndex, 0)
		traceIDList := make([]string, 0)
		for rows.Next() {
			var traceIndex datavmodels.TraceIndex
			err := rows.Scan(&traceIndex.StartTime, &traceIndex.ServiceName, &traceIndex.OperationName, &traceIndex.TraceId, &traceIndex.Duration)
			if err != nil {
				logger.Warn("Error scan trace index", "error", err)
				continue
			}
			traceIndex.StartTime = traceIndex.StartTime / 1e3
			traceIndex.Duration = traceIndex.Duration / 1e3
			traceIndex.TraceName = traceIndex.ServiceName + ": " + traceIndex.OperationName
			traceIndexMap0[traceIndex.TraceId] = append(traceIndexMap0[traceIndex.TraceId], &traceIndex)
		}

		traceIndexMap := make(map[string]*datavmodels.TraceIndex, 0)
		for _, traceIndexList := range traceIndexMap0 {
			// find root operation, which has the smallest start time
			var minStartTime uint64 = 0
			var rootOperationIndex int = 0
			for i, traceIndex := range traceIndexList {
				if minStartTime == 0 {
					minStartTime = traceIndex.StartTime
					rootOperationIndex = i
					continue
				}

				if traceIndex.StartTime < minStartTime {
					minStartTime = traceIndex.StartTime
					rootOperationIndex = i
				}
			}

			traceIndex := traceIndexList[rootOperationIndex]
			traceIndexMap[traceIndex.TraceId] = traceIndex
		}

		for _, traceIndex := range traceIndexMap {
			traceIDList = append(traceIDList, traceIndex.TraceId)
		}

		// query extra trace info
		query = fmt.Sprintf("select traceId,serviceName,hasError,count(spanId) from %s.%s where traceId in ('%s') GROUP by traceId,serviceName,hasError", config.Data.Observability.DefaultTraceDB, datavmodels.DefaultTraceIndexTable, strings.Join(traceIDList, "','"))
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

		for _, traceIndex := range traceIndexMap {
			traceIndexes = append(traceIndexes, traceIndex)
		}
	}

	var res1 *models.PluginResultData
	if traceIds == "" {
		// query metrics
		aggregateQuery := "count(DISTINCT traceId) as count"
		groupBy := "ts_bucket"
		if groupby != "" {
			if strings.HasPrefix(groupby, "resources.") {
				realGroup := groupby[10:]
				groupby = fmt.Sprintf("resourcesMap['%s'] as groupBy", realGroup) + ","
			} else if strings.HasPrefix(groupby, "attributes.") {
				realGroup := groupby[11:]

				groupby = fmt.Sprintf("attributesMap['%s'] as groupBy", realGroup) + ","
			} else {
				groupby = groupby + " as groupBy,"
			}
			groupBy = groupBy + ", groupBy"
		}

		switch aggregate {
		case "rate":
			aggregateQuery = fmt.Sprintf("round(count(DISTINCT traceId) / %d,2) as rate", step)
		case "sum":
			aggregateQuery = "round(sum(duration) / 1e6,2) as sum"
		case "avg":
			aggregateQuery = "round(avg(duration) / 1e6,2) as avg"
		case "max":
			aggregateQuery = "round(max(duration) / 1e6,2) as max"
		case "min":
			aggregateQuery = "round(min(duration) / 1e6,2) as min"
		case "p50":
			aggregateQuery = "round(quantile(0.5)(duration) / 1e6,2) as p50"
		case "p90":
			aggregateQuery = "round(quantile(0.9)(duration) / 1e6,2) as p90"
		case "p95":
			aggregateQuery = "round(quantile(0.95)(duration) / 1e6,2) as p95"
		case "p99":
			aggregateQuery = "round(quantile(0.99)(duration) / 1e6,2) as p99"
		}

		metricsQuery := fmt.Sprintf("SELECT toStartOfInterval(fromUnixTimestamp64Nano(startTime), INTERVAL %d SECOND) AS ts_bucket, %s %s from %s.%s where (startTime >= %d AND startTime <= %d AND %s) group by %s order by ts_bucket", step, groupby, aggregateQuery, config.Data.Observability.DefaultTraceDB, datavmodels.DefaultTraceIndexTable, start*1e9, end*1e9, domainQuery+operationNameQuery1, groupBy)

		rows, err := conn.Query(c.Request.Context(), metricsQuery)
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

	query := fmt.Sprintf("SELECT startTime, traceId, model FROM %s.%s WHERE traceId='%s'", config.Data.Observability.DefaultTraceDB, datavmodels.DefaultTraceSpansTable, traceID)
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

type TagKey struct {
	Name     string `json:"name"`
	Type     string `json:"type"`     // "attributes" or "resources"
	DataType string `json:"dataType"` // string, bool or float64
	IsColumn bool   `json:"isColumn"`
}

func GetTraceTagKeys(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	// tenant := models.GetTenant(c)
	// domainQuery := datavutils.BuildBasicDomainQuery(tenant, params)

	var domainQuery string
	service := c.Query("service")
	if service == "" {
		serviceI := datavutils.GetValueListFromParams(params, "service")
		if serviceI != nil {
			domainQuery += fmt.Sprintf(" AND serviceName in ('%s')", strings.Join(serviceI, "','"))
		}
	} else {
		domainQuery += fmt.Sprintf(" AND serviceName='%s'", service)
	}

	if domainQuery != "" {
		domainQuery = "WHERE " + domainQuery + " AND isColumn=true"
	} else {
		domainQuery = "WHERE isColumn=true"
	}

	// query := fmt.Sprintf("SELECT DISTINCT tagKey,tagType,dataType FROM %s.%s %s ", config.Data.Observability.DefaultTraceDB, datavmodels.DefaultSpanAttributeKeysTable, domainQuery)
	// // query traceIDs
	// rows, err := conn.Query(c.Request.Context(), query)
	// if err != nil {
	// 	logger.Warn("Error Query trace tag keys", "query", query, "error", err)
	// 	return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	// }
	// defer rows.Close()

	tags := make([]*TagKey, 0)
	// for rows.Next() {
	// 	tag := &TagKey{}
	// 	err := rows.Scan(&tag.Name, &tag.Type, &tag.DataType)
	// 	if err != nil {
	// 		logger.Warn("Error scan trace tag key", "error", err)
	// 		continue
	// 	}
	// 	tag.IsColumn = false
	// 	tags = append(tags, tag)
	// }

	query := fmt.Sprintf("SELECT DISTINCT tagKey,tagType,dataType FROM %s.%s %s ", config.Data.Observability.DefaultTraceDB, datavmodels.DefaultSpanAttributeKeysTable, domainQuery)
	// query traceIDs
	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		logger.Warn("Error Query trace tag keys", "query", query, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	for rows.Next() {
		tag := &TagKey{}
		err := rows.Scan(&tag.Name, &tag.Type, &tag.DataType)
		if err != nil {
			logger.Warn("Error scan trace tag key", "error", err)
			continue
		}
		tag.IsColumn = true
		tags = append(tags, tag)
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", tags)
}
