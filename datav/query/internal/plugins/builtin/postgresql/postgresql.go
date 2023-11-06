package postgresql

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"fmt"
	"reflect"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/models"
)

var datasourceName = "postgresql"

type PostgreSQLPlugin struct {
}

var (
	conns     = make(map[int64]*sql.DB)
	connsLock = &sync.Mutex{}
)

func (*PostgreSQLPlugin) Query(c *gin.Context, ds *models.Datasource) models.PluginResult {
	query := c.Query("query")
	conn, ok := conns[ds.Id]
	if !ok {
		conn, err := connectToPostgreSQL(ds.URL, ds.Data["database"], ds.Data["username"], ds.Data["password"])
		if err != nil {
			colorlog.RootLogger.Warn("connect to postgresql error:", err, "ds_id", ds.Id, "url", ds.URL)
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
		colorlog.RootLogger.Info("Error query postgresql :", "error", err, "ds_id", ds.Id, "query", query)
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
			if tp == reflect.TypeOf(time.Time{}).String() {
				types[columns[i]] = "time"
			}
		}

		err = rows.Scan(v...)
		if err != nil {
			colorlog.RootLogger.Info("Error scan postgresql :", "error", err, "ds_id", ds.Id)
			continue
		}

		for i, v0 := range v {
			v1, ok := v0.(*time.Time)
			if ok {
				v[i] = v1.Unix()
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

func (*PostgreSQLPlugin) TestDatasource(c *gin.Context) models.PluginResult {
	url := c.Query("url")
	database := c.Query("database")
	username := c.Query("username")
	password := c.Query("password")
	db, err := connectToPostgreSQL(url, database, username, password)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	if err = db.PingContext(context.Background()); err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	return models.GenPluginResult(models.PluginStatusSuccess, "", nil)
}

func init() {
	// register datasource
	models.RegisterPlugin(datasourceName, &PostgreSQLPlugin{})
}

func connectToPostgreSQL(url, database, username, password string) (*sql.DB, error) {
	dsn := fmt.Sprintf("postgres://%s:%s@%s/%s", username, password, url, database)
	colorlog.RootLogger.Debug("connect to postgresql dsn: ", dsn)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	db.SetMaxIdleConns(5)
	db.SetMaxOpenConns(5)
	db.SetConnMaxLifetime(time.Duration(10) * time.Minute)
	db.SetConnMaxIdleTime(time.Duration(10) * time.Minute)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()
	if err = db.PingContext(ctx); err != nil {
		return nil, err
	}
	return db, nil
}
