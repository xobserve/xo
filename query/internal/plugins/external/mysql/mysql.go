package mysql

import (
	"database/sql"
	"database/sql/driver"
	"reflect"
	"sync"

	pluginUtils "github.com/DataObserve/datav/query/internal/plugins/utils"
	"github.com/DataObserve/datav/query/pkg/colorlog"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

var datasourceName = "mysql"

type MysqlPlugin struct {
}

var (
	conns     = make(map[int64]*sql.DB)
	connsLock = &sync.Mutex{}
)

func (*MysqlPlugin) Query(c *gin.Context, ds *models.Datasource) models.PluginResult {
	query := c.Query("query")
	conn, ok := conns[ds.Id]
	if !ok {
		conn, err := pluginUtils.ConnectToMysql(ds.URL, ds.Data["database"], ds.Data["username"], ds.Data["password"])
		if err != nil {
			colorlog.RootLogger.Warn("connect to mysql error:", err, "ds_id", ds.Id, "url", ds.URL)
			return models.PluginResult{
				Status: models.PluginStatusError,
				Error:  err.Error(),
			}
		}
		connsLock.Lock()
		conns[ds.Id] = conn
		connsLock.Unlock()
	}
	rows, err := conn.Query(query)
	if err != nil {
		colorlog.RootLogger.Info("Error query mysql :", "error", err, "ds_id", ds.Id, "query", query)
		return models.PluginResult{
			Status: models.PluginStatusError,
			Error:  err.Error(),
		}
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		colorlog.RootLogger.Info("Error get rows columns :", "error", err, "ds_id", ds.Id, "query", query)
		return models.PluginResult{
			Status: models.PluginStatusError,
			Error:  err.Error(),
		}
	}
	columnTypes, err := rows.ColumnTypes()
	if err != nil {
		colorlog.RootLogger.Info("Error get rows column types :", "error", err, "ds_id", ds.Id, "query", query)
		return models.PluginResult{
			Status: models.PluginStatusError,
			Error:  err.Error(),
		}
	}

	types := make(map[string]string)
	data := make([][]interface{}, 0)
	for rows.Next() {
		v := make([]interface{}, len(columns))
		for i := 0; i < len(columns); i++ {
			t := columnTypes[i].ScanType()
			v[i] = reflect.New(t).Interface()

			tp := t.String()

			if tp == reflect.TypeOf(sql.NullTime{}).String() {
				types[columns[i]] = "time"
			}
		}

		err = rows.Scan(v...)
		if err != nil {
			colorlog.RootLogger.Info("Error scan mysql :", "error", err, "ds_id", ds.Id)
			continue
		}

		for i, v0 := range v {
			v1, ok := v0.(*sql.NullTime)
			if ok {
				v[i] = v1.Time.Unix()
			} else {
				v2, ok := v0.(driver.Valuer)
				if ok {
					v[i], _ = v2.Value()
				}
			}
		}
		data = append(data, v)
	}

	return models.PluginResult{
		Status: models.PluginStatusSuccess,
		Error:  "",
		Data: map[string]interface{}{
			"columns": columns,
			"data":    data,
			"types":   types,
		}}
}

func (*MysqlPlugin) TestDatasource(c *gin.Context) models.PluginResult {
	return pluginUtils.TestMysqlDatasource(c)
}

func init() {
	// register datasource
	models.RegisterPlugin(datasourceName, &MysqlPlugin{})
}
