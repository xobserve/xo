// Copyright 2023 xobserve.io Team
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
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	storageData "github.com/xobserve/xo/query/internal/storage/data"
	"github.com/xobserve/xo/query/pkg/colorlog"
	"github.com/xobserve/xo/query/pkg/config"
	"github.com/xobserve/xo/query/pkg/db"
	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/models"
	"github.com/xobserve/xo/query/pkg/utils"
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
		logger.Info("sqlite data path:", "path", path)
		driver, _ := otelsql.Register("sqlite3",
			otelsql.TraceQueryWithArgs(),
			// otelsql.AllowRoot(),
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

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Crit("new transaction error", "error", err)
		return err
	}
	defer tx.Rollback()

	now := time.Now()
	_, err = tx.Exec(`INSERT INTO tenant (id,name,nickname, data ,created,updated) VALUES (?,?,?,?,?,?)`,
		models.DefaultTenantId, models.DefaultTenant, models.DefaultTenant, "{}", now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		logger.Crit("init super admin error", "error:", err)
		return err
	}

	_, err = tx.Exec(`INSERT INTO tenant_user (tenant_id,user_id,role, created,updated) VALUES (?,?,?,?,?)`,
		models.DefaultTenantId, models.SuperAdminId, models.ROLE_SUPER_ADMIN, now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		logger.Crit("init super admin error", "error:", err)
		return err
	}

	_, err = tx.Exec(`INSERT INTO user (id,username,password,salt,role,email,created,updated) VALUES (?,?,?,?,?,?,?,?)`,
		models.SuperAdminId, models.SuperAdminUsername, adminPW, adminSalt, models.ROLE_SUPER_ADMIN, "", now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		logger.Crit("init super admin error", "error:", err)
		return err
	}

	_, err = models.CreateTeam(context.Background(), tx, models.DefaultTenantId, models.SuperAdminId, models.DefaultTeamName, "")
	if err != nil && !e.IsErrUniqueConstraint(err) {
		logger.Crit("create team error", "error:", err)
		return err
	}

	err = tx.Commit()
	if err != nil {
		logger.Crit("commit sql transaction error", "error", err)
		return err
	}

	return nil
}
