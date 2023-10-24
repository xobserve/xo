package api

import (
	"fmt"
	"strconv"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	datavmodels "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/models"
	pluginUtils "github.com/DataObserve/datav/query/internal/plugins/utils"
	"github.com/DataObserve/datav/query/pkg/config"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

func GetLogs(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	step, _ := strconv.ParseInt(c.Query("step"), 10, 64)
	start, _ := strconv.ParseInt(c.Query("start"), 10, 64)
	end, _ := strconv.ParseInt(c.Query("end"), 10, 64)
	page, _ := strconv.ParseInt(c.Query("page"), 10, 64)

	perPageLogsI := params["perPage"]
	perPageLogs := 100
	if perPageLogsI != nil {
		perPage := int(perPageLogsI.(float64))
		if perPage != 0 {
			perPageLogs = perPage
		}
	}

	logId := c.Query("logId")
	logTs := c.Query("logTs")

	if logId != "" {
		// query logs
		logsQuery := fmt.Sprintf(datavmodels.LogSelectSQL+" FROM %s.%s  where timestamp = '%s' AND id = '%s'", config.Data.Observability.DefaultLogDB, datavmodels.DefaultLogsTable, logTs, logId)

		rows, err := conn.Query(c.Request.Context(), logsQuery)
		if err != nil {
			logger.Warn("Error Query log", "query", logsQuery, "error", err)
			return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		}
		defer rows.Close()

		logger.Info("Query log", "query", logsQuery)

		res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
		if err != nil {
			logger.Warn("Error conver rows to data", "error", err)
			return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		}

		return models.GenPluginResult(models.PluginStatusSuccess, "", res)
	}

	// query logs
	logsQuery := fmt.Sprintf(datavmodels.LogsSelectSQL+" FROM %s.%s  where (timestamp >= %d AND timestamp <= %d) order by timestamp desc LIMIT %d OFFSET %d", config.Data.Observability.DefaultLogDB, datavmodels.DefaultLogsTable, start*1e9, (end)*1e9, perPageLogs, page*int64(perPageLogs))

	rows, err := conn.Query(c.Request.Context(), logsQuery)
	if err != nil {
		logger.Warn("Error Query logs", "query", logsQuery, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query logs", "query", logsQuery)

	res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
	if err != nil {
		logger.Warn("Error conver rows to data", "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	var res1 *models.PluginResultData
	if page == 0 {
		// query metrics
		metricsQuery := fmt.Sprintf("SELECT toStartOfInterval(fromUnixTimestamp64Nano(timestamp), INTERVAL %d SECOND) AS ts_bucket, if(multiSearchAny(severity, ['error', 'err', 'emerg', 'alert', 'crit', 'fatal']), 'errors', 'others') as severity_group, count(*) as count from %s.%s where (timestamp >= %d AND timestamp <= %d) group by ts_bucket,severity_group order by ts_bucket", step, config.Data.Observability.DefaultLogDB, datavmodels.DefaultLogsTable, start*1e9, (end)*1e9)

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

	return models.GenPluginResult(models.PluginStatusSuccess, "", map[string]*models.PluginResultData{
		"logs":  res,
		"chart": res1,
	})
}
