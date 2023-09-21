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
package datasource

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/DataObserve/datav/backend/internal/user"
	"github.com/DataObserve/datav/backend/pkg/colorlog"
	"github.com/DataObserve/datav/backend/pkg/common"
	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/DataObserve/datav/backend/pkg/e"
	"github.com/DataObserve/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

var logger = colorlog.RootLogger.New("logger", "datasource")

func SaveDatasource(c *gin.Context) {
	ds := &models.Datasource{}
	err := c.Bind(&ds)
	if err != nil {
		logger.Warn("save datasource request data error", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError(err.Error()))
		return
	}

	u := user.CurrentUser((c))
	// only admin or team admin can do this
	if !u.Role.IsAdmin() {
		isTeamAdmin, err := models.IsTeamAdmin(ds.TeamId, u.Id)
		if err != nil {
			logger.Warn("Error query team admin", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}
		if !isTeamAdmin {
			c.JSON(403, common.RespError(e.NoPermission))
			return
		}
	}

	now := time.Now()
	if ds.Id == 0 {
		// create
		res, err := db.Conn.Exec("INSERT INTO datasource (name,type,url,team_id,created,updated) VALUES (?,?,?,?,?,?)", ds.Name, ds.Type, ds.URL, ds.TeamId, now, now)
		if err != nil {
			if e.IsErrUniqueConstraint(err) {
				c.JSON(http.StatusBadRequest, common.RespError("name alread exist"))
				return
			}
			logger.Warn("insert datasource error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespInternalError())
			return
		}

		id, _ := res.LastInsertId()
		ds.Id = id

	} else {
		if ds.Id == models.InitTestDataDatasourceId {
			c.JSON(http.StatusForbidden, common.RespError("default testdata datasource cannot be edit"))
			return
		}
		// update
		_, err = db.Conn.Exec("UPDATE datasource SET name=?,type=?,url=?,updated=? WHERE id=?", ds.Name, ds.Type, ds.URL, now, ds.Id)
		if err != nil {
			if e.IsErrUniqueConstraint(err) {
				c.JSON(http.StatusBadRequest, common.RespError("name alread exist"))
				return
			}
			logger.Warn("insert datasource error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespInternalError())
			return
		}
	}

	c.JSON(http.StatusOK, common.RespSuccess(ds.Id))
}

func GetDatasources(c *gin.Context) {
	teamId := c.Query("teamId")
	dss := make([]*models.Datasource, 0)

	var rows *sql.Rows
	var err error

	if strings.TrimSpace(teamId) != "" {
		rows, err = db.Conn.Query("SELECT id,name,type,url,team_id, created FROM datasource WHERE team_id=?", teamId)
	} else {
		rows, err = db.Conn.Query("SELECT id,name,type,url,team_id, created FROM datasource")
	}

	if err != nil {
		logger.Warn("get datasource error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespInternalError())
		return
	}
	defer rows.Close()
	for rows.Next() {
		ds := &models.Datasource{}
		err := rows.Scan(&ds.Id, &ds.Name, &ds.Type, &ds.URL, &ds.TeamId, &ds.Created)
		if err != nil {
			logger.Warn("get datasource error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespInternalError())
			return
		}
		dss = append(dss, ds)
	}

	c.JSON(http.StatusOK, common.RespSuccess(dss))
}

func DeleteDatasource(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	if id == 0 {
		c.JSON(http.StatusBadRequest, common.RespError("bad datasource id"))
		return
	}

	if id == 1 {
		c.JSON(http.StatusBadRequest, common.RespError("can not delete default test data datasource"))
		return
	}

	ds, err := GetDatasource(id)
	if err != nil {
		logger.Warn("Error query datasource", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	u := user.CurrentUser((c))
	if !u.Role.IsAdmin() {
		isTeamAdmin, err := models.IsTeamAdmin(ds.TeamId, u.Id)
		if err != nil {
			logger.Warn("Error query team admin", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}
		if !isTeamAdmin {
			c.JSON(403, common.RespError(e.NoPermission))
			return
		}
	}

	_, err = db.Conn.Exec("DELETE FROM datasource WHERE id=?", id)
	if err != nil {
		logger.Warn("delete datasource error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespInternalError())
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetDatasource(id int64) (*models.Datasource, error) {
	ds := &models.Datasource{}
	err := db.Conn.QueryRow("SELECT name,type,url, created FROM datasource WHERE id=?", id).Scan(&ds.Name, &ds.Type, &ds.URL, &ds.Created)
	return ds, err
}
