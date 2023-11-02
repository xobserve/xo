package api

import (
	"fmt"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	datavmodels "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/models"
	pluginUtils "github.com/DataObserve/datav/query/internal/plugins/utils"
	"github.com/DataObserve/datav/query/pkg/config"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

func GetEnvironments(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {

	tenant := models.DefaultTenant
	domainQuery := fmt.Sprintf(" tenantId='%s'", tenant)

	query := fmt.Sprintf("SELECT DISTINCT environment FROM %s.%s WHERE %s", config.Data.Observability.DefaultTraceDB, datavmodels.DefaultServiceOperationsTable, domainQuery)

	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query environments", "query", query)

	res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", res)
}
