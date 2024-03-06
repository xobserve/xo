package api

import (
	"fmt"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/gin-gonic/gin"
	xobservemodels "github.com/xobserve/xo/query/internal/plugins/builtin/xobserve/models"
	pluginUtils "github.com/xobserve/xo/query/internal/plugins/utils"
	"github.com/xobserve/xo/query/pkg/models"
)

func GetNamespaces(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	tenant := models.DefaultTenant
	domainQuery := fmt.Sprintf(" tenant='%s'", tenant)

	query := fmt.Sprintf("SELECT DISTINCT namespace FROM %s.%s WHERE %s", xobservemodels.DefaultTraceDB, xobservemodels.DefaultServiceOperationsTable, domainQuery)

	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query namespaces", "query", query)

	res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", res)
}
