package api

import (
	"fmt"
	"strconv"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	datavmodels "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/models"
	datavutils "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/utils"
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
		logsQuery := fmt.Sprintf(datavmodels.LogSelectSQL+" FROM %s.%s  where timestamp = ? AND id = ?", config.Data.Observability.DefaultLogDB, datavmodels.DefaultLogsTable)

		rows, err := conn.Query(c.Request.Context(), logsQuery, logTs, logId)
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

	search := c.Query("search")
	var searchQuery string
	var searchArgs []interface{}
	if search != "" {
		var err error
		searchQuery, searchArgs, err = datavutils.ParseSearchQuery(search)
		if err != nil {
			logger.Info("Error parse search query", "error", err, "query", search)
			return models.GenPluginResult(models.PluginStatusError, "Parse search query error: "+err.Error(), nil)
		}
	}
	// query logs
	logsQuery := fmt.Sprintf(datavmodels.LogsSelectSQL+" FROM %s.%s  where (timestamp >= ? AND timestamp <= ? %s) order by timestamp desc LIMIT %d OFFSET %d", config.Data.Observability.DefaultLogDB, datavmodels.DefaultLogsTable, searchQuery, perPageLogs, page*int64(perPageLogs))

	args := append([]interface{}{start * 1e9, (end) * 1e9}, searchArgs...)
	rows, err := conn.Query(c.Request.Context(), logsQuery, args...)
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
		metricsQuery := fmt.Sprintf("SELECT toStartOfInterval(fromUnixTimestamp64Nano(timestamp), INTERVAL %d SECOND) AS ts_bucket, if(multiSearchAny(severity, ['error', 'err', 'emerg', 'alert', 'crit', 'fatal']), 'errors', 'others') as severity_group, count(*) as count from %s.%s where (timestamp >= ? AND timestamp <= ? %s) group by ts_bucket,severity_group order by ts_bucket", step, config.Data.Observability.DefaultLogDB, datavmodels.DefaultLogsTable, searchQuery)

		rows, err = conn.Query(c.Request.Context(), metricsQuery, args...)
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
