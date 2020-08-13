package sqls

import (
	"encoding/json"
	"github.com/apm-ai/datav/backend/internal/teams"
	"github.com/apm-ai/datav/backend/pkg/utils"
	"time"
	"fmt"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/apm-ai/datav/backend/pkg/db"
	"database/sql"
	"github.com/apm-ai/datav/backend/pkg/log"
)

var adminSalt,adminPW string 

func init() {
	salt,err  := utils.GetRandomString(10)
	if err != nil {
		panic(err)
	}

	adminSalt = salt

	pw,err := utils.EncodePassword("admin",salt)
	if (err != nil) {
		panic(err)
	}

	adminPW = pw
}

func openSql() {
	d, err := sql.Open("sqlite3", "./datav.db")
	if err != nil {
		log.RootLogger.Crit("open sqlite error", "error:",err)
		panic(err)
	}
	db.SQL = d
}

func CreateTables() {
	openSql()
	// create tables
	for _, q := range CreateTableSqls {
		_, err := db.SQL.Exec(q)
		if err != nil {
			log.RootLogger.Crit("sqlite create table error", "error:",err, "sql:", q)
			panic(err)
		}
	}
	
	now := time.Now()
	// insert init data
	_,err := db.SQL.Exec(`INSERT INTO user (id,username,password,salt,email,sidemenu,created,updated) VALUES (?,?,?,?,?,?,?,?)`,
		models.SuperAdminId,models.SuperAdminUsername,adminPW,adminSalt,models.SuperAdminUsername+"@localhost",models.DefaultMenuId,now,now)
	if err != nil {
		log.RootLogger.Crit("init super admin error","error:",err)
		panic(err)
	}

	_,err = db.SQL.Exec(`INSERT INTO team (id,name,created_by,created,updated) VALUES (?,?,?,?,?)`,
		models.GlobalTeamId,models.GlobalTeamName,models.SuperAdminId,now,now)
	if err != nil {
		log.RootLogger.Crit("init global team error","error:",err)
		panic(err)
	}

	_,err = db.SQL.Exec(`INSERT INTO team_member (team_id,user_id,role,created,updated) VALUES (?,?,?,?,?)`,
		models.GlobalTeamId,models.SuperAdminId,models.ROLE_ADMIN,now,now)
	if err != nil {
		log.RootLogger.Crit("init global team member error","error:",err)
		panic(err)
	}

	// init global team permission
	teams.InitTeamPermission(models.GlobalTeamId)

	// insert default sidemenu
	menu := []map[string]string {
		{
			"id": "home",
			"url": "/dashboard",
			"title": "Home Dashboard",
			"icon": "home-alt",
		},
	}
	menuStr, err := json.Marshal(menu)
	if err != nil {
		log.RootLogger.Crit("json encode default menu error ","error:",err)
		panic(err)
	}

	_,err = db.SQL.Exec(`INSERT INTO sidemenu (id,team_id,desc,data,created_by,created,updated) VALUES (?,?,?,?,?,?,?)`,
		models.DefaultMenuId,models.GlobalTeamId, models.DefaultMenuDesc, menuStr,models.SuperAdminId,now,now)
	if err != nil {
		log.RootLogger.Crit("init default side menu  error","error:",err)
		panic(err)
	}

	_,err = db.SQL.Exec(`INSERT INTO dashboard (id,uid,title,version,created_by,folder_id,data,created,updated) VALUES (?,?,?,?,?,?,?,?,?)`,
	-1,"-1","global variables",1,1,-1,`{"annotations":{"list":[]},"editable":true,"id":-1,"uid":"-1","links":[],"panels":[],"schemaVersion":0,"tags":[],"templating":{"list":[]},"title":"global variables","version":0}`,now,now)
	if err != nil {
		log.RootLogger.Crit("init global variables  error","error:",err)
		panic(err)
	}
}


func CreateTable(names []string) {
	defer func() {
		if err := recover();err != nil {
			DropTable(names)
		}
	}()
	openSql()
	for _,tbl := range names {
		q,ok := CreateTableSqls[tbl]
		if !ok {
			log.RootLogger.Crit("target sql table not exist","table_name",tbl)
			panic("create sql of '" + tbl + "' table not exist")
		}

		// check table already exists
		_,err :=db.SQL.Query(fmt.Sprintf("SELECT * from %s LIMIT 1",tbl))
		if err == nil || err == sql.ErrNoRows {
			log.RootLogger.Info("Table already exist,skip creating","table_name",tbl)
			continue
		}

		_,err = db.SQL.Exec(q)
		if err != nil {
			log.RootLogger.Crit("database error","error",err.Error())
			panic(err.Error())
		}

		log.RootLogger.Info("sql table created ok","table_name",tbl)
	}
}

func DropTable(names []string) {
	openSql()
	for _,tbl := range names {
		q := fmt.Sprintf("DROP TABLE IF EXISTS %s",tbl)
		_,err := db.SQL.Exec(q)
		if err != nil {
			log.RootLogger.Warn("drop table error", "error",err,"query",q)
		}
		log.RootLogger.Info("sql table dropped ok","table_name",tbl)
	}
}

var CreateTableSqls = map[string]string {
	"user" : `CREATE TABLE IF NOT EXISTS user (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username VARCHAR(255) NOT NULL UNIQUE,
		name VARCHAR(255) DEFAULT '',
		password VARCHAR(50) DEFAULT '',
		salt VARCHAR(50),

		mobile VARCHAR(11) DEFAULT '',
		email VARCHAR(255) NOT NULL UNIQUE,

		sidemenu INTEGER   NOT NULL DEFAULT '1',

		last_seen_at DATETIME DEFAULT CURRENT_DATETIME,
		is_diabled BOOL NOT NULL DEFAULT 'false',

		created DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS user_username
		ON user (username);
	CREATE INDEX IF NOT EXISTS user_email
		ON user (email);`,

	"sessions" : `CREATE TABLE IF NOT EXISTS sessions (
		sid              VARCHAR(255) primary key,   
		user_id          INTEGER
	);
	`,

	"data_source" : `CREATE TABLE IF NOT EXISTS data_source (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uid VARCHAR(40) NOT NULL UNIQUE,
		name VARCHAR(255) NOT NULL UNIQUE,

		version INT NOT NULL,
		type VARCHAR(255) NOT NULL,
		url VARCHAR(255) NOT NULL,
		
		is_default BOOL NOT NULL,

		password VARCHAR(255),
		user VARCHAR(255),
		database VARCHAR(255),

		with_credentials BOOL,
		basic_auth BOOL NOT NULL,
		basic_auth_user VARCHAR(255),
		basic_auth_password VARCHAR(255),
	
		json_data TEXT DEFAULT '{}',
		secure_json_data TEXT DEFAULT '{}',

		created_by  INTEGER NOT NULL,
		created DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS datasource_name
		ON data_source (name);
	CREATE INDEX  IF NOT EXISTS datasource_name_uid
		ON data_source (uid);
	`,

	"dashboard" : `CREATE TABLE IF NOT EXISTS dashboard (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		uid                 VARCHAR(40) NOT NULL UNIQUE,
		title               VARCHAR(255) NOT NULL UNIQUE,
		version 			INT NOT NULL,
		owned_by            INTEGER NOT NULL DEFAULT '1',
		created_by 			INTEGER NOT NULL,
		folder_id           INT NOT NULL DEFAULT '0',
		data				MEDIUMTEXT NOT NULL,
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS dashboard_uid
		ON dashboard (uid);
	CREATE INDEX IF NOT EXISTS dashboard_created_by
		ON dashboard (owned_by);
	CREATE INDEX IF NOT EXISTS dashboard_owned_by
		ON dashboard (created_by);
	CREATE INDEX IF NOT EXISTS dashboard_folder_id
		ON dashboard (folder_id);
	`,

	"dashboard_acl" : `CREATE TABLE IF NOT EXISTS dashboard_acl (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		dashboard_id        INTEGER NOT NULL,
		team_id             INTEGER NOT NULL,
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS dashboard_acl_dashboard_id
		ON dashboard_acl (dashboard_id);
	CREATE INDEX IF NOT EXISTS dashboard_acl_team_id
		ON dashboard_acl (team_id);
	CREATE UNIQUE INDEX IF NOT EXISTS dashboard_acl_dashboard_team_id
		ON dashboard_acl (dashboard_id,team_id);
	`,
	
	"dashboard_user_acl": `CREATE TABLE IF NOT EXISTS dashboard_user_acl (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		dashboard_id        INTEGER NOT NULL,
		user_id             INTEGER NOT NULL,
		permission          VARCHAR(40) NOT NULL,
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);

	CREATE INDEX IF NOT EXISTS dashboard_user_acl_dash_id
		ON dashboard_user_acl (dashboard_id);
	CREATE UNIQUE INDEX IF NOT EXISTS dashboard_user_acl_dash_id_user_id
		ON dashboard_user_acl (dashboard_id,user_id);
	`,
	
	"team_acl": `CREATE TABLE IF NOT EXISTS team_acl (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		team_id        		INTEGER NOT NULL,
		role                VARCHAR(10) NOT NULL,
		permission          INT NOT NULL,
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS team_acl_team_id
		ON team_acl (team_id);
	CREATE UNIQUE INDEX IF NOT EXISTS team_acl_team_id_role_permission
		ON team_acl (team_id,role,permission);
	`,

	"folder" : `CREATE TABLE IF NOT EXISTS folder (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		parent_id           INT NOT NULL,
		uid                 VARCHAR(40) NOT NULL UNIQUE,
		title                VARCHAR(255) NOT NULL UNIQUE,
		created_by 			INTEGER NOT NULL,
		owned_by            INTEGER NOT NULL DEFAULT '1',
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS folder_parent_id
		ON folder (parent_id);
	CREATE INDEX IF NOT EXISTS folder_owned_by
		ON folder (owned_by);
	`,

	"team" : `CREATE TABLE IF NOT EXISTS team (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		name                VARCHAR(255) NOT NULL UNIQUE,
		created_by          INTEGER NOT NULL,        
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS team_name
		ON team (name);
	CREATE INDEX IF NOT EXISTS team_created_by
		ON team (created_by);
	`,

	"team_member" : `CREATE TABLE IF NOT EXISTS team_member (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		team_id             INTEGER NOT NULL,
		user_id 			INTEGER NOT NULL,   
		role 				VARCHAR(10) DEFAULT 'Viewer',
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS team_member_team_id
		ON team_member (team_id);
	CREATE INDEX IF NOT EXISTS team_member_user_id
		ON team_member (user_id);
	CREATE UNIQUE INDEX IF NOT EXISTS team_member_team_user_id 
		ON team_member (team_id, user_id);
	`,

	"sidemenu" : `
	CREATE TABLE IF NOT EXISTS sidemenu (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		team_id             INTEGER NOT NULL,
		desc                TEXT DEFAUlT '',
		data                MEDIUMTEXT NOT NULL,
		created_by          INTEGER NOT NULL,
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS sidemenu_team_id
		ON sidemenu (team_id);
	CREATE UNIQUE INDEX IF NOT EXISTS sidemenu_team_id
		ON sidemenu (team_id);
	`,

	"annotation" : `
	CREATE TABLE IF NOT EXISTS annotation (
		id 					INTEGER PRIMARY KEY AUTOINCREMENT,
		dashboard_id        INTEGER,
		panel_id            INTEGER,
		text                TEXT NOT NULL,
		alert_id            INTEGER,

		time                INTEGER NOT NULL,
		time_end            INTEGER NOT NULL,
		
		created_by          INTEGER NOT NULL,
		created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
		updated 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
	);
	CREATE INDEX IF NOT EXISTS annotation_dashboard_id
		ON annotation (dashboard_id);
	CREATE INDEX IF NOT EXISTS annotation_time
		ON annotation (time);
	CREATE INDEX IF NOT EXISTS annotation_time_end
		ON annotation (time_end);
	`,
}

