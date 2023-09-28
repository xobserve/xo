// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package storage

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/DataObserve/datav/backend/internal/dashboard"
	storageData "github.com/DataObserve/datav/backend/internal/storage/data"
	"github.com/DataObserve/datav/backend/pkg/colorlog"
	"github.com/DataObserve/datav/backend/pkg/config"
	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/DataObserve/datav/backend/pkg/e"
	"github.com/DataObserve/datav/backend/pkg/models"
	"github.com/DataObserve/datav/backend/pkg/utils"
	_ "github.com/go-sql-driver/mysql"
	"go.nhat.io/otelsql"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.10.0"
)

var logger = colorlog.RootLogger.New("logger", "storage")

var adminSalt, adminPW string

func Init(tc *sdktrace.TracerProvider) error {
	err := connectDatabase(tc)
	if err != nil {
		return err
	}

	err = createTables()
	if err != nil {
		return err
	}

	// update table structure to current version
	err = update()
	if err != nil {
		return err
	}
	err = createIndex()
	if err != nil {
		return err
	}

	// insert admin user
	err = initTables()
	if err != nil {
		return err
	}

	return nil
}

func connectDatabase(tc *sdktrace.TracerProvider) error {
	var d *sql.DB
	var err error
	if config.Data.Database.ConnectTo == "mysql" {
		driver, _ := otelsql.Register("mysql",
			otelsql.TraceQueryWithArgs(),
			// otelsql.AllowRoot(),
			otelsql.WithTracerProvider(tc),
			otelsql.WithSystem(semconv.DBSystemMySQL),
			otelsql.WithInstanceName(fmt.Sprintf("%s:%d", config.Data.Database.Host, config.Data.Database.Port)),
		)
		d, err = sql.Open(
			driver,
			fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true&interpolateParams=true", config.Data.Database.Account, config.Data.Database.AccountSecret, config.Data.Database.Host, config.Data.Database.Port, config.Data.Database.Database),
		)
	} else if config.Data.Database.ConnectTo == "sqlite" {
		var path string
		dataPath := strings.TrimSpace(config.Data.Paths.SqliteData)
		if dataPath == "" {
			path = "datav.db"
		} else {
			exist, _ := utils.FileExists(dataPath)
			if !exist {
				err := os.MkdirAll(dataPath, os.ModePerm)
				if err != nil {
					logger.Error("create data dir error", "data_path", dataPath, "error", err)
					return err
				}
			}

			path = dataPath + "/datav.db"
		}
		driver, _ := otelsql.Register("sqlite3",
			otelsql.TraceQueryWithArgs(),
			otelsql.AllowRoot(),
			otelsql.WithTracerProvider(tc),
			otelsql.WithSystem(semconv.DBSystemSqlite),
		)

		d, err = sql.Open(driver, path+"?cache=shared&mode=rwc")
	} else {
		return errors.New("error database")
	}

	if err != nil {
		logger.Crit("connect to mysql error", "error:", err)
		return err
	}

	err = d.Ping()
	if err != nil {
		return err
	}

	db.Conn = d

	return nil
}

func createTables() error {
	if config.Data.Database.ConnectTo == "sqlite" {
		_, err := db.Conn.Exec(storageData.SqliteSQL)
		return err
	}

	return nil

}

func createIndex() error {
	if config.Data.Database.ConnectTo == "sqlite" {
		_, err := db.Conn.Exec(storageData.SqliteIndex)
		return err
	}

	return nil

}

func initTables() error {
	salt, err := utils.GetRandomString(10)
	if err != nil {
		panic(err)
	}

	adminSalt = salt

	pw, err := utils.EncodePassword("admin", salt)
	if err != nil {
		panic(err)
	}

	adminPW = pw

	now := time.Now()
	// insert init data
	_, err = db.Conn.Exec(`INSERT INTO user (id,username,password,salt,email,created,updated) VALUES (?,?,?,?,?,?,?)`,
		models.SuperAdminId, models.SuperAdminUsername, adminPW, adminSalt, "", now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		logger.Crit("init super admin error", "error:", err)
		return err
	}

	_, err = db.Conn.Exec(`INSERT INTO team (id,name,is_public,created_by,created,updated) VALUES (?,?,?,?,?,?)`,
		models.GlobalTeamId, models.GlobalTeamName, true, models.SuperAdminId, now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		logger.Crit("init global team error", "error:", err)
		return err
	}

	_, err = db.Conn.Exec(`INSERT INTO team_member (team_id,user_id,role,created,updated) VALUES (?,?,?,?,?)`,
		models.GlobalTeamId, models.SuperAdminId, models.ROLE_ADMIN, now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		logger.Crit("init global team member error", "error:", err)
		return err
	}

	// insert home dashboard
	_, err = dashboard.ImportFromJSON(storageData.HomeDashboard, models.SuperAdminId)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		logger.Crit("init home dashboard error", "error:", err)
		return err
	}

	// insert alert dashboard
	_, err = dashboard.ImportFromJSON(storageData.AlertDashboard, models.SuperAdminId)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		logger.Crit("init home dashboard error", "error:", err)
		return err
	}

	// insert global sidemenu
	menuStr, err := json.Marshal(models.InitTeamMenu)
	if err != nil {
		logger.Crit("json encode default menu error ", "error:", err)
		return err
	}

	_, err = db.Conn.Exec(`INSERT INTO sidemenu (id,team_id,is_public,brief,data,created_by,created,updated) VALUES (?,?,?,?,?,?,?,?)`,
		models.DefaultMenuId, models.GlobalTeamId, true, models.DefaultMenuBrief, menuStr, models.SuperAdminId, now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		logger.Crit("init default side menu  error", "error:", err)
		return err
	}

	// insert Test Data dataousrce
	_, err = db.Conn.Exec(`INSERT INTO datasource (id,name,type,url,created,updated) VALUES (?,?,?,?,?,?)`,
		models.InitTestDataDatasourceId, "TestData", models.DatasourceTestData, "", now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		logger.Crit("init testdata datasource  error", "error:", err)
		return err
	}

	return nil
}
