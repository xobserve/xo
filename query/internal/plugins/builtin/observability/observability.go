package clickhouse

import (
	"context"
	"net"
	"reflect"
	"strings"
	"sync"
	"time"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/DataObserve/datav/query/internal/plugins/builtin/observability/api"
	"github.com/DataObserve/datav/query/pkg/colorlog"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

/* Query plugin for clickhouse database */

var datasourceName = "observability"

type ObservabilityPlugin struct{}

var conns = make(map[int64]ch.Conn)
var connsLock = &sync.Mutex{}

func (p *ObservabilityPlugin) Query(c *gin.Context, ds *models.Datasource) models.PluginResult {
	query := c.Query("query")
	if query == api.TestDatasourceAPI {
		return testDatasource(c)
	}

	conn, ok := conns[ds.Id]
	if !ok {
		var err error
		conn, err = connectToClickhouse(ds.URL, "default", "default", "")
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

	columns := rows.Columns()
	columnTypes := rows.ColumnTypes()
	types := make(map[string]string)
	data := make([][]interface{}, 0)
	for rows.Next() {
		v := make([]interface{}, len(columns))
		for i := range v {
			t := columnTypes[i].ScanType()
			v[i] = reflect.New(t).Interface()

			tp := t.String()
			if tp == "time.Time" {
				types[columns[i]] = "time"
			}
		}

		err = rows.Scan(v...)
		if err != nil {
			colorlog.RootLogger.Info("Error scan clickhouse :", "error", err, "ds_id", ds.Id)
			continue
		}

		for i, v0 := range v {
			v1, ok := v0.(*time.Time)
			if ok {
				v[i] = v1.Unix()
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

func init() {
	// register datasource
	models.RegisterPlugin(datasourceName, &ObservabilityPlugin{})
}

func connectToClickhouse(url, database, username, password string) (ch.Conn, error) {
	conn, err := ch.Open(&ch.Options{
		Addr: strings.Split(url, ","),
		Auth: ch.Auth{
			Database: database,
			Username: username,
			Password: password,
		},
		DialContext: func(ctx context.Context, addr string) (net.Conn, error) {
			var d net.Dialer
			return d.DialContext(ctx, "tcp", addr)
		},
		Debug: false,
		// Debugf: func(format string, v ...any) {
		// 	fmt.Printf(format, v)
		// },
		Settings: ch.Settings{
			"max_execution_time": 60,
		},
		Compression: &ch.Compression{
			Method: ch.CompressionLZ4,
		},
		DialTimeout:          time.Second * 30,
		MaxOpenConns:         5,
		MaxIdleConns:         5,
		ConnMaxLifetime:      time.Duration(10) * time.Minute,
		ConnOpenStrategy:     ch.ConnOpenInOrder,
		BlockBufferSize:      10,
		MaxCompressionBuffer: 10240,
		ClientInfo: ch.ClientInfo{ // optional, please see Client info section in the README.md
			Products: []struct {
				Name    string
				Version string
			}{
				{Name: "my-app", Version: "0.1"},
			},
		},
	})
	if err != nil {
		return nil, err
	}

	err = conn.Ping(context.Background())
	if err != nil {
		return nil, err
	}

	return conn, nil
}

func testDatasource(c *gin.Context) models.PluginResult {
	url := c.Query("url")
	conn, err := connectToClickhouse(url, "default", "default", "")
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	err = conn.Ping(context.Background())
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", nil)
}