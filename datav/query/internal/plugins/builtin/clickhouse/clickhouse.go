package clickhouse

import (
	"sync"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/gin-gonic/gin"
	pluginUtils "github.com/xobserve/xo/query/internal/plugins/utils"
	"github.com/xobserve/xo/query/pkg/colorlog"
	"github.com/xobserve/xo/query/pkg/models"
)

/* Query plugin for clickhouse database */

var datasourceName = "clickhouse"

type ClickHousePlugin struct{}

var conns = make(map[int64]ch.Conn)
var connsLock = &sync.Mutex{}

func (p *ClickHousePlugin) Query(c *gin.Context, ds *models.Datasource) models.PluginResult {
	query := c.Query("query")
	conn, ok := conns[ds.Id]
	if !ok {
		var err error
		conn, err = pluginUtils.ConnectToClickhouse(ds.URL, ds.Data["database"], ds.Data["username"], ds.Data["password"])
		if err != nil {
			colorlog.RootLogger.Warn("connect to clickhouse error:", err, "ds_id", ds.Id, "url", ds.URL)
			return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
		}
		connsLock.Lock()
		conns[ds.Id] = conn
		connsLock.Unlock()
	}

	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		colorlog.RootLogger.Info("Error query clickhouse :", "error", err, "ds_id", ds.Id, "query:", query)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	colorlog.RootLogger.Info("Query from clickhouse", "query", query)

	res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", res)
}

func (p *ClickHousePlugin) TestDatasource(c *gin.Context) models.PluginResult {
	return pluginUtils.TestClickhouseDatasource(c)
}

func init() {
	// register datasource
	models.RegisterPlugin(datasourceName, &ClickHousePlugin{})
}
