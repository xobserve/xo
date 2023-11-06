package api

import (
	"fmt"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	observexmodels "github.com/DataObserve/observex/query/internal/plugins/builtin/observex/models"
	pluginUtils "github.com/DataObserve/observex/query/internal/plugins/utils"
	"github.com/DataObserve/observex/query/pkg/config"
	"github.com/DataObserve/observex/query/pkg/models"
	"github.com/gin-gonic/gin"
)

func GetNamespaces(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {

	tenant := models.DefaultTenant
	domainQuery := fmt.Sprintf(" tenant='%s'", tenant)

	query := fmt.Sprintf("SELECT DISTINCT namespace FROM %s.%s WHERE %s", config.Data.Observability.DefaultTraceDB, observexmodels.DefaultServiceOperationsTable, domainQuery)

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
