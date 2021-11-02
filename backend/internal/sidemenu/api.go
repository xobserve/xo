package sidemenu

import (
	"database/sql"

	"github.com/savecost/datav/backend/internal/session"

	// "fmt"
	"encoding/json"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/savecost/datav/backend/internal/acl"
	"github.com/savecost/datav/backend/internal/invasion"
	"github.com/savecost/datav/backend/pkg/common"
	"github.com/savecost/datav/backend/pkg/db"
	"github.com/savecost/datav/backend/pkg/i18n"
	"github.com/savecost/datav/backend/pkg/models"
)

func GetMenu(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if teamId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	menu, err := QuerySideMenu(0, teamId)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Error("query side menu error", "error", err)
			c.JSON(500, common.ResponseInternalError())
		}
		return
	}

	c.JSON(200, common.ResponseSuccess(menu))
}

func CreateMenu(c *gin.Context) {
	req := &models.SideMenu{}
	c.Bind(&req)

	if req.TeamId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if !acl.IsTeamAdmin(req.TeamId, c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	userId := session.CurrentUserId(c)
	data, _ := json.Marshal(req.Data)
	now := time.Now()
	res, err := db.SQL.Exec("INSERT INTO sidemenu (team_id,is_public,desc,data,created_by,created,updated) VALUES (?,?,?,?,?,?,?)",
		req.TeamId, false, req.Desc, data, userId, now, now)
	if err != nil {
		logger.Error("create sidemenu error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	id, _ := res.LastInsertId()
	c.JSON(200, common.ResponseSuccess(id))
}

func UpdateMenu(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if teamId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	menu := &models.SideMenu{}
	c.Bind(&menu)

	if !acl.IsTeamAdmin(menu.TeamId, c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	data, _ := json.Marshal(menu.Data)
	_, err := db.SQL.Exec("UPDATE sidemenu SET is_public=?,desc=?,data=?,updated=? WHERE id=? and team_id=?", menu.IsPublic, menu.Desc, data, time.Now(), menu.Id, menu.TeamId)
	if err != nil {
		logger.Error("update sidemenu error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}
