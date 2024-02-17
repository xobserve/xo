package api

import (
	"fmt"
	"strconv"
	"strings"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/gin-gonic/gin"
	xobservemodels "github.com/xObserve/xObserve/query/internal/plugins/builtin/xobserve/models"
	xobserveutils "github.com/xObserve/xObserve/query/internal/plugins/builtin/xobserve/utils"
	pluginUtils "github.com/xObserve/xObserve/query/internal/plugins/utils"
	"github.com/xObserve/xObserve/query/pkg/models"
)

func GetDependencyGraph(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	start, _ := strconv.ParseInt(c.Query("start"), 10, 64)
	end, _ := strconv.ParseInt(c.Query("end"), 10, 64)

	source := xobserveutils.GetValueListFromParams(params, "source")
	target := xobserveutils.GetValueListFromParams(params, "target")

	var teamId int64 = 1
	domainQuery := xobserveutils.BuildBasicDomainQuery(teamId, params)

	if source != nil {
		domainQuery += fmt.Sprintf(" AND src in ('%s')", strings.Join(source, "','"))
	}
	if target != nil {
		domainQuery += fmt.Sprintf(" AND dest in ('%s')", strings.Join(target, "','"))
	}

	query := fmt.Sprintf(`WITH
	quantilesMergeState(0.5, 0.75, 0.9, 0.95, 0.99)(duration_quantiles_state) AS duration_quantiles_state,
	finalizeAggregation(duration_quantiles_state) AS result
SELECT
	src,
	dest,
	result[1] AS p50,
	result[2] AS p75,
	result[3] AS p90,
	result[4] AS p95,
	result[5] AS p99,
	sum(total_count) as calls,
	sum(error_count) as errors
FROM %s.%s	
WHERE toUInt64(toDateTime(timestamp)) >= ? AND toUInt64(toDateTime(timestamp)) <= ? AND %s GROUP BY src, dest`,
		xobservemodels.DefaultTraceDB, xobservemodels.DefaultDependencyGraphTable, domainQuery)

	rows, err := conn.Query(c.Request.Context(), query, start, end)
	if err != nil {
		logger.Warn("Error Query dependency graph", "query", query, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query denendency graph", "query", query)

	res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
	if err != nil {
		logger.Warn("Error conver rows to data", "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", res)
}
