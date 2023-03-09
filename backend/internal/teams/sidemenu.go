package teams

import (
	"database/sql"
	"encoding/json"

	"strconv"
	"time"

	"github.com/ai-apm/aiapm/backend/internal/user"
	"github.com/ai-apm/aiapm/backend/pkg/common"
	"github.com/ai-apm/aiapm/backend/pkg/db"
	"github.com/ai-apm/aiapm/backend/pkg/e"
	"github.com/ai-apm/aiapm/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

func QuerySideMenu(id int64, teamId int64) (*models.SideMenu, error) {
	menu := &models.SideMenu{}
	var rawJson []byte
	err := db.Conn.QueryRow("SELECT id,team_id,is_public,brief,data from sidemenu WHERE id=? or team_id=?", id, teamId).Scan(&menu.Id, &menu.TeamId, &menu.IsPublic, &menu.Brief, &rawJson)
	if err != nil {
		return nil, err
	}

	json.Unmarshal(rawJson, &menu.Data)
	return menu, nil
}

func GetSideMenu(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if teamId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	menu, err := QuerySideMenu(0, teamId)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Error("query side menu error", "error", err)
			c.JSON(500, common.RespInternalError())
		}
		return
	}

	c.JSON(200, common.RespSuccess(menu))
}

func CreateMenu(c *gin.Context) {
	req := &models.SideMenu{}
	c.Bind(&req)

	if req.TeamId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := user.CurrentUser(c)
	isTeamAdmin, err := models.IsTeamAdmin(req.TeamId, u.Id)
	if err != nil {
		logger.Error("check team admin error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if !isTeamAdmin {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	data, _ := json.Marshal(req.Data)
	now := time.Now()
	res, err := db.Conn.Exec("INSERT INTO sidemenu (team_id,is_public,brief,data,created_by,created,updated) VALUES (?,?,?,?,?,?,?)",
		req.TeamId, false, req.Brief, data, u.Id, now, now)
	if err != nil {
		logger.Error("create sidemenu error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	id, _ := res.LastInsertId()
	c.JSON(200, common.RespSuccess(id))
}

func UpdateSideMenu(c *gin.Context) {
	menu := &models.SideMenu{}
	c.Bind(&menu)

	u := user.CurrentUser(c)
	isTeamAdmin, err := models.IsTeamAdmin(menu.TeamId, u.Id)
	if err != nil {
		logger.Error("check team admin error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if !isTeamAdmin {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	data, _ := json.Marshal(menu.Data)
	_, err = db.Conn.Exec("UPDATE sidemenu SET is_public=?,brief=?,data=?,updated=? WHERE id=? and team_id=?", menu.IsPublic, menu.Brief, data, time.Now(), menu.Id, menu.TeamId)
	if err != nil {
		logger.Error("update sidemenu error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}
