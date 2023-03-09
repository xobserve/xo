package storage

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/ai-apm/aiapm/backend/pkg/db"
	"github.com/ai-apm/aiapm/backend/pkg/e"
	"github.com/ai-apm/aiapm/backend/pkg/log"
	"github.com/ai-apm/aiapm/backend/pkg/models"
	"github.com/ai-apm/aiapm/backend/pkg/utils"
	_ "github.com/go-sql-driver/mysql"
)

var adminSalt, adminPW string

func Init() error {
	err := connectDatabase()
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
	d, err := sql.Open("mysql", "root:Sunface-Mysql-im.dev@/aiapm?parseTime=true")
	if err != nil {
		log.RootLogger.Crit("connect to mysql error", "error:", err)
		return err
	}

	db.Conn = d

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
		models.SuperAdminId, models.SuperAdminUsername, adminPW, adminSalt, models.SuperAdminUsername+"@localhost", now, now)
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
			"title":    "首页大盘",
			"url":      "/",
			"icon":     "FaHome",
			"expanded": true,
		},
		{
			"title": "应用监控",
			"url":   "/apps",
			"icon":  "FaCubes",
			"children": []map[string]string{
				{
					"title": "应用列表",
					"url":   "/apps/list",
				},
				{
					"title": "接口统计",
					"url":   "/apps/api",
				},
			},
			"expanded": true,
		},
		{
			"title":    "服务器监控",
			"url":      "/servers",
			"icon":     "FaRegChartBar",
			"expanded": true,
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

	return nil
}
