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

	// @performace: 对 traceId 做 skip index
	traceIds := strings.TrimSpace(c.Query("traceIds"))

	if traceIds != "" {

	}

	environment := datavutils.GetValueListFromParams(params, "environment")

	var domainQuery string
	if environment != nil {
		domainQuery += fmt.Sprintf(" AND environment in ('%s')", strings.Join(environment, "','"))
	}

	// query logs
	query := fmt.Sprintf(datavmodels.TracesSelectSQL+` FROM %s.%s WHERE timestamp >= %d AND timestamp <= %d AND traceID IN (SELECT traceID FROM signoz_traces.distributed_signoz_index_v2 WHERE timestamp >= %d AND timestamp <= %d AND  parentSpanID=='' %s ORDER BY durationNano DESC LIMIT 100) GROUP BY timestamp,traceID,serviceName `, config.Data.Observability.DefaultTraceDB, datavmodels.DefaultIndexTable, start, end, start, end, domainQuery)

	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		logger.Warn("Error Query logs", "query", query, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query logs", "query", query)

	res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
	if err != nil {
		logger.Warn("Error conver rows to data", "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
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

	return models.GenPluginResult(models.PluginStatusSuccess, "", map[string]*models.PluginResultData{
		"traces": res,
		"chart":  res1,
	})
}
