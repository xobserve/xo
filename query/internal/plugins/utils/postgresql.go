package pluginUtils

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/DataObserve/datav/query/pkg/colorlog"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func TestPostgresqlDatasource(c *gin.Context) models.PluginResult {
	url := c.Query("url")
	database := c.Query("database")
	username := c.Query("username")
	password := c.Query("password")
	db, err := ConnectToPostgreSQL(url, database, username, password)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	if err = db.PingContext(context.Background()); err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	return models.GenPluginResult(models.PluginStatusSuccess, "", nil)
}

func ConnectToPostgreSQL(url, database, username, password string) (*sql.DB, error) {
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
