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
	"database/sql"
	"encoding/json"

	"strconv"
	"time"

	"github.com/gin-gonic/gin"
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

	u := c.MustGet("currentUser").(*models.User)
	var userId int64
	if u != nil {
		userId = u.Id
	}

	visible, err := models.IsTeamVisibleToUser(c.Request.Context(), teamId, userId)
	if err != nil {
		logger.Warn("check team visible error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	if !visible {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	menu, err := models.QuerySideMenu(c.Request.Context(), teamId)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Error("query side menu error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
	}

	c.JSON(200, common.RespSuccess(menu))
}

func UpdateSideMenu(c *gin.Context) {
	menu := &models.SideMenu{}
	c.Bind(&menu)

	u := c.MustGet("currentUser").(*models.User)
	// only team admin can do this
	isTeamAdmin, err := models.IsTeamAdmin(c.Request.Context(), menu.TeamId, u.Id)
	if err != nil {
		logger.Warn("check team admin error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if !isTeamAdmin {
		c.JSON(403, common.RespError(e.NeedTeamAdmin))
		return
	}

	data, _ := json.Marshal(menu.Data)
	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE team SET sidemenu=?,updated=? WHERE id=?", data, time.Now(), menu.TeamId)
	if err != nil {
		logger.Error("update sidemenu error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}
