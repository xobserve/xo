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

func GetDependencyGraph(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	start, _ := strconv.ParseInt(c.Query("start"), 10, 64)
	end, _ := strconv.ParseInt(c.Query("end"), 10, 64)

	source := datavutils.GetValueListFromParams(params, "source")
	target := datavutils.GetValueListFromParams(params, "target")
	environment := datavutils.GetValueListFromParams(params, "environment")
	cluster := datavutils.GetValueListFromParams(params, "cluster")
	namespace := datavutils.GetValueListFromParams(params, "namespace")

	var domainQuery string
	if source != nil {
		domainQuery += fmt.Sprintf(" AND src in ('%s')", strings.Join(source, "','"))
	}
	if target != nil {
		domainQuery += fmt.Sprintf(" AND dest in ('%s')", strings.Join(target, "','"))
	}
	if environment != nil {
		domainQuery += fmt.Sprintf(" AND environment in ('%s')", strings.Join(environment, "','"))
	}
	if cluster != nil {
		domainQuery += fmt.Sprintf(" AND cluster in ('%s')", strings.Join(cluster, "','"))
	}
	if namespace != nil {
		domainQuery += fmt.Sprintf(" AND namespace in ('%s')", strings.Join(namespace, "','"))
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
WHERE toUInt64(toDateTime(timestamp)) >= ? AND toUInt64(toDateTime(timestamp)) <= ? %s GROUP BY src, dest`,
		config.Data.Observability.DefaultTraceDB, datavmodels.DefaultDependencyGraphTable, domainQuery)

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
