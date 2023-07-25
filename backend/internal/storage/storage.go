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
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/DataObserve/datav/backend/pkg/config"
	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/DataObserve/datav/backend/pkg/e"
	"github.com/DataObserve/datav/backend/pkg/log"
	"github.com/DataObserve/datav/backend/pkg/models"
	"github.com/DataObserve/datav/backend/pkg/utils"
	_ "github.com/go-sql-driver/mysql"
)

var logger = log.RootLogger.New("logger", "storage")

var adminSalt, adminPW string

func Init() error {

	err := connectDatabase()
	if err != nil {
		return err
	}

	err = createTables()
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

func connectDatabase() error {
	var d *sql.DB
	var err error
	if config.Data.Database.ConnectTo == "mysql" {
		d, err = sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true", config.Data.Database.Account, config.Data.Database.AccountSecret, config.Data.Database.Host, config.Data.Database.Port, config.Data.Database.Database))
	} else {
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

		d, err = sql.Open("sqlite3", path)
	}

	if err != nil {
		log.RootLogger.Crit("connect to mysql error", "error:", err)
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
		_, err := db.Conn.Exec(storageSQL)
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
		log.RootLogger.Crit("init super admin error", "error:", err)
		return err
	}

	_, err = db.Conn.Exec(`INSERT INTO team (id,name,created_by,created,updated) VALUES (?,?,?,?,?)`,
		models.GlobalTeamId, models.GlobalTeamName, models.SuperAdminId, now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		log.RootLogger.Crit("init global team error", "error:", err)
		return err
	}

	_, err = db.Conn.Exec(`INSERT INTO team_member (team_id,user_id,role,created,updated) VALUES (?,?,?,?,?)`,
		models.GlobalTeamId, models.SuperAdminId, models.ROLE_ADMIN, now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		log.RootLogger.Crit("init global team member error", "error:", err)
		return err
	}

	// insert global sidemenu
	menu := []map[string]interface{}{
		{
			"title":       "首页大盘",
			"url":         "/home",
			"icon":        "FaHome",
			"dashboardId": models.HomeDashboardId,
			"expanded":    true,
		},
	}
	menuStr, err := json.Marshal(menu)
	if err != nil {
		log.RootLogger.Crit("json encode default menu error ", "error:", err)
		return err
	}

	_, err = db.Conn.Exec(`INSERT INTO sidemenu (id,team_id,is_public,brief,data,created_by,created,updated) VALUES (?,?,?,?,?,?,?,?)`,
		models.DefaultMenuId, models.GlobalTeamId, true, models.DefaultMenuBrief, menuStr, models.SuperAdminId, now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		log.RootLogger.Crit("init default side menu  error", "error:", err)
		return err
	}

	// insert Test Data dataousrce
	_, err = db.Conn.Exec(`INSERT INTO datasource (id,name,type,url,created,updated) VALUES (?,?,?,?,?,?)`,
		models.InitTestDataDatasourceId, "TestData", models.DatasourceTestData, "", now, now)
	if err != nil && !e.IsErrUniqueConstraint(err) {
		log.RootLogger.Crit("init testdata datasource  error", "error:", err)
		return err
	}

	return nil
}

const storageSQL = `
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) DEFAULT '',
    password VARCHAR(100) DEFAULT '',
    salt VARCHAR(50),
    mobile VARCHAR(11) DEFAULT '',
    email VARCHAR(255) NOT NULL UNIQUE,
    last_seen_at DATETIME,
    is_diabled BOOL NOT NULL DEFAULT false,
    sidemenu INTEGER DEFAULT 1,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS user_username ON user (username);

CREATE INDEX IF NOT EXISTS user_email ON user (email);

CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    user_id INTEGER
);

CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    brief VARCHAR(255) DEFAUlT '',
    created_by INTEGER NOT NULL,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS team_name ON team (name);

CREATE INDEX IF NOT EXISTS team_created_by ON team (created_by);

CREATE TABLE IF NOT EXISTS team_member (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(10) DEFAULT 'Viewer',
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS team_member_team_id ON team_member (team_id);

CREATE INDEX IF NOT EXISTS team_member_user_id ON team_member (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS team_member_team_user_id ON team_member (team_id, user_id);

CREATE TABLE IF NOT EXISTS sidemenu (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    is_public BOOL NOT NULL,
    brief VARCHAR(255) DEFAUlT '',
    data MEDIUMTEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS sidemenu_team_id ON sidemenu  (team_id);

CREATE TABLE IF NOT EXISTS variable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(60) NOT NULL,
    type VARCHAR(10) NOT NULL,
    value MEDIUMTEXT,
    description VARCHAR(255) DEFAULT '',
    datasource INTEGER,
    refresh VARCHAR(32),
    enableMulti BOOL NOT NULL DEFAULT false,
    enableAll BOOL NOT NULL DEFAULT false,
    sort TINYINT DEFAULT 0,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS variable_name ON variable (name);

CREATE TABLE IF NOT EXISTS dashboard (
    id VARCHAR(40) PRIMARY KEY NOT NULL,
    title VARCHAR(255) NOT NULL,
    owned_by INTEGER NOT NULL DEFAULT '1',
    created_by INTEGER NOT NULL,
    data MEDIUMTEXT NOT NULL,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);


CREATE INDEX IF NOT EXISTS  dashboard_owned_by ON dashboard (owned_by);

CREATE INDEX IF NOT EXISTS  dashboard_created_by ON dashboard (created_by);

CREATE TABLE IF NOT EXISTS dashboard_history (
    dashboard_id VARCHAR(40),
    version DATETIME,
    changes TEXT,
    history MEDIUMTEXT
);


CREATE UNIQUE INDEX IF NOT EXISTS  dashboard_id_version ON dashboard_history (dashboard_id,version);


CREATE TABLE IF NOT EXISTS datasource (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(64),
    type VARCHAR(32),
    url VARCHAR(255),
    data MEDIUMTEXT,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS  datasource_name ON datasource (name);
`
