package server

import (
	"strings"

	_ "github.com/savecost/datav/backend/internal/alerting/notifiers"
	"github.com/savecost/datav/backend/internal/sqls"
	"github.com/savecost/datav/backend/pkg/db"
	_ "github.com/savecost/datav/backend/pkg/tsdb/prometheus"
)

func initDatabase() error {
	err := sqls.ConnectDatabase()
	if err != nil {
		return err
	}

	// check whether tables have been created
	var id int64
	err = db.SQL.QueryRow("select id from dashboard where id=?", -1).Scan(&id)
	if err != nil && !strings.Contains(err.Error(), "no such table") {
		return err
	}

	if id != -1 {
		logger.Info("Database tables have not been created, start creating")
		err = sqls.InitTables()
		if err != nil {
			return err
		}
		logger.Info("Create database tables ok!")
	}

	return nil
}
