package internal

import (
	"time"

	"github.com/gocql/gocql"

	"github.com/tracedt/koala/dashboard/internal/pkg/config"
	"github.com/tracedt/koala/dashboard/internal/pkg/cql"
	"github.com/tracedt/koala/dashboard/internal/pkg/misc"
	"github.com/tracedt/koala/pkg/log"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"go.uber.org/zap"
)

// Start dashboard server
func Start(confPath string) {
	// init config
	config.Init(confPath)

	// init logger
	misc.Logger = log.Init(config.Dashboard.LogLevel)

	// init cql
	err := connectToCql()
	if err != nil {
		misc.Logger.Fatal("connect to cql cluster error", zap.String("error", err.Error()))
	}

	misc.Logger.Info("configuration", zap.Any("conf", config.Dashboard))
	e := echo.New()
	e.Pre(middleware.RemoveTrailingSlash())
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{Level: 5}))
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowHeaders:     append([]string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept}, misc.SessionID),
		AllowCredentials: true,
	}))

	// route the request to corresponding api
	apiRoute(e)

	// start dashboard api server
	e.Logger.Fatal(e.Start(config.Dashboard.ListenAddr))
}

// Shutdown the dashboard server
func Shutdown() {
	cql.Static.Close()
	cql.Dynamic.Close()
}

// connect to cassandra/scyllaDB cluster
func connectToCql() error {
	var n = cql.StaticKeySpace
	for {
		if n > cql.DynamicKeySpace {
			return nil
		}
		c := gocql.NewCluster(config.Dashboard.CQL.Cluster...)
		c.Timeout = cql.ConnectTimeout * time.Second
		c.ReconnectInterval = cql.ReconnectInterval * time.Millisecond

		if n == cql.StaticKeySpace {
			c.Keyspace = config.Dashboard.CQL.Keyspace.Static
			c.NumConns = 3
		} else {
			c.Keyspace = config.Dashboard.CQL.Keyspace.Dynamic
			c.NumConns = config.Dashboard.CQL.ConnectionNum
		}

		session, err := c.CreateSession()
		if err != nil {
			return err
		}

		if n == cql.StaticKeySpace {
			cql.Static = session
		} else {
			cql.Dynamic = session
		}
		n++
	}
}
