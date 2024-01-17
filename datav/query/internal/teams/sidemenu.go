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
package teams

import (
	"database/sql"
	"encoding/json"

	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/acl"
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
	if err := acl.CanViewTeam(c.Request.Context(), teamId, u.Id); err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	menu, err := models.QuerySideMenu(c.Request.Context(), teamId, nil)
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
	err := acl.CanEditTeam(c.Request.Context(), menu.TeamId, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
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
