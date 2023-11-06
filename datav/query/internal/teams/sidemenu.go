// Copyright 2023 xObserve.io Team
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
package teams

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"

	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/user"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

func GetSideMenu(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if teamId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	menu, err := models.QuerySideMenu(c.Request.Context(), 0, teamId)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Error("query side menu error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
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
	isTeamAdmin, err := models.IsTeamAdmin(c.Request.Context(), req.TeamId, u.Id)
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
	res, err := db.Conn.ExecContext(c.Request.Context(), "INSERT INTO sidemenu (team_id,is_public,brief,data,created_by,created,updated) VALUES (?,?,?,?,?,?,?)",
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
	// only team admin can do this
	if !u.Role.IsAdmin() {
		isTeamAdmin, err := models.IsTeamAdmin(c.Request.Context(), menu.TeamId, u.Id)
		if err != nil {
			logger.Warn("check team admin error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		if !isTeamAdmin {
			c.JSON(403, common.RespError(e.NoPermission))
			return
		}
	}

	data, _ := json.Marshal(menu.Data)
	_, err := db.Conn.ExecContext(c.Request.Context(), "UPDATE sidemenu SET is_public=?,brief=?,data=?,updated=? WHERE team_id=?", menu.IsPublic, menu.Brief, data, time.Now(), menu.TeamId)
	if err != nil {
		logger.Error("update sidemenu error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func GetAvailableSidMenusForUser(c *gin.Context) {
	userId := user.CurrentUserId(c)

	teamIds, err := models.QueryVisibleTeamsByUserId(c.Request.Context(), userId)
	if err != nil {
		logger.Warn("query team members by userId error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	// get sidemenus which are set to public in teams
	rows, err := db.Conn.QueryContext(c.Request.Context(), "SELECT team_id from sidemenu where is_public=? and team_id != ?", true, models.GlobalTeamId)
	if err != nil {
		logger.Warn("query public team sidemenus error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer rows.Close()
	for rows.Next() {
		var tid int64
		rows.Scan(&tid)
		exist := false
		for _, id := range teamIds {
			if id == tid {
				exist = true
			}
		}

		if !exist {
			teamIds = append(teamIds, tid)
		}
	}

	sidemenus := make([]*models.SideMenu, 0)

	for _, tid := range teamIds {
		sm, err := models.QuerySideMenu(c.Request.Context(), 0, tid)
		if err != nil {
			if err != sql.ErrNoRows {
				logger.Error("query sidemenu error", "teamId:", tid, "error", err)
			}
			continue
		}

		team, err := models.QueryTeam(c.Request.Context(), tid, "")
		if err != nil {
			logger.Error("query team error", "teamId:", tid, "error", err)
			continue
		}

		sidemenus = append(sidemenus, &models.SideMenu{
			Brief:    sm.Brief,
			TeamId:   team.Id,
			TeamName: team.Name,
		})
	}

	c.JSON(200, common.RespSuccess(sidemenus))
}

func SelectSideMenuForUser(c *gin.Context) {
	userId := user.CurrentUserId(c)
	teamId := c.Param("teamId")

	err := SetSideMenuForUser(c.Request.Context(), teamId, userId)
	if err != nil {
		logger.Warn("update side menu error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func SetSideMenuForUser(ctx context.Context, teamId string, userId int64) error {
	_, err := db.Conn.ExecContext(ctx, "UPDATE user SET sidemenu=? WHERE id=?", teamId, userId)
	if err != nil {
		return err
	}

	return nil
}

func GetCurrentSidemenu(c *gin.Context) {
	u := user.CurrentUser(c)

	menu, err := models.QuerySideMenu(c.Request.Context(), u.SideMenu, 0)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("query sidemenu error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError(err.Error()))
			return
		}
	}

	c.JSON(http.StatusOK, common.RespSuccess(menu))
}
