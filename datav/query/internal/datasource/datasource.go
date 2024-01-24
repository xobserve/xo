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
package datasource

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/acl"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "datasource")

var datasources = make(map[int64]*models.Datasource)
var datasourcesLock = &sync.Mutex{}

func InitDatasources() {
	for {
		dss := make([]*models.Datasource, 0)

		var rows *sql.Rows
		var err error
		rows, err = db.Conn.QueryContext(context.Background(), "SELECT id,name,type,url,team_id,data,template_id, created FROM datasource")

		if err != nil {
			logger.Warn("get datasource error", "error", err)
			time.Sleep(time.Second * 10)
			return
		}

		defer rows.Close()
		for rows.Next() {
			ds := &models.Datasource{}
			var rawdata []byte
			err := rows.Scan(&ds.Id, &ds.Name, &ds.Type, &ds.URL, &ds.TeamId, &rawdata, &ds.TemplateId, &ds.Created)
			if err != nil {
				logger.Warn("scan datasource error", "error", err)
				continue
			}
			if rawdata != nil {
				err = json.Unmarshal(rawdata, &ds.Data)
				if err != nil {
					logger.Warn("Error decode datasource data", "error", err, "data", rawdata)
					continue
				}
			}
			dss = append(dss, ds)
		}

		datasourcesLock.Lock()
		for _, ds := range dss {
			datasources[ds.Id] = ds
		}
		datasourcesLock.Unlock()

		time.Sleep(time.Second * 10)
	}
}

func CreateDatasource(c *gin.Context) {
	ds := &models.Datasource{}
	err := c.Bind(&ds)
	if err != nil {
		logger.Warn("save datasource request data error", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError(err.Error()))
		return
	}

	u := c.MustGet("currentUser").(*models.User)

	err = acl.CanEditTeam(c.Request.Context(), ds.TeamId, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("new tx error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	err = models.ImportDatasource(c.Request.Context(), ds, tx, false)
	if err != nil {
		logger.Warn("create datasource error", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError(err.Error()))
		return
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(ds.Id))
}

func UpdateDatasource(c *gin.Context) {
	ds := &models.Datasource{}
	err := c.Bind(&ds)
	if err != nil {
		logger.Warn("save datasource request data error", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError(err.Error()))
		return
	}

	u := c.MustGet("currentUser").(*models.User)

	now := time.Now()
	data, err := json.Marshal(ds.Data)
	if err != nil {
		logger.Warn("Error encode datasource data", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	_, err = GetDatasource(c.Request.Context(), ds.TeamId, ds.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("datasource not found"))
			return
		}
		logger.Warn("Error query datasource", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	err = acl.CanEditTeam(c.Request.Context(), ds.TeamId, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE datasource SET name=?,type=?,url=?,data=?,updated=? WHERE team_id=? and id=?", ds.Name, ds.Type, ds.URL, data, now, ds.TeamId, ds.Id)
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

func GetDatasources(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Query("teamId"), 10, 64)
	u := c.MustGet("currentUser").(*models.User)

	_, err := models.QueryTeamMember(c.Request.Context(), teamId, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("you are not in this team"))
			return
		}
		logger.Warn("query team member error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	dss, err := GetDatasourcesByTeamId(c.Request.Context(), teamId)
	if err != nil {
		logger.Warn("get datasource error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespInternalError())
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(dss))
}

func GetDatasourcesByTeamId(ctx context.Context, teamId int64) ([]*models.Datasource, error) {
	dss := make([]*models.Datasource, 0)

	var rows *sql.Rows

	rows, err := db.Conn.QueryContext(ctx, "SELECT id,name,type,url,team_id,data,template_id, created FROM datasource WHERE team_id=?", teamId)

	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		ds := &models.Datasource{}
		var rawdata []byte
		err := rows.Scan(&ds.Id, &ds.Name, &ds.Type, &ds.URL, &ds.TeamId, &rawdata, &ds.TemplateId, &ds.Created)
		if err != nil {
			return nil, err
		}
		if rawdata != nil {
			err = json.Unmarshal(rawdata, &ds.Data)
			if err != nil {
				return nil, err
			}
		}

		dss = append(dss, ds)
	}

	return dss, nil
}
func DeleteDatasource(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	if id == 0 {
		c.JSON(http.StatusBadRequest, common.RespError("bad datasource id"))
		return
	}

	ds, err := GetDatasource(c.Request.Context(), teamId, id)
	if err != nil {
		logger.Warn("Error query datasource", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	err = acl.CanEditTeam(c.Request.Context(), ds.TeamId, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "DELETE FROM datasource WHERE team_id=? and id=?", teamId, id)
	if err != nil {
		logger.Warn("delete datasource error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespInternalError())
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetDatasource(ctx context.Context, teamId, id int64) (*models.Datasource, error) {
	ds, ok := datasources[id]
	if !ok {
		ds := &models.Datasource{}
		var rawdata []byte
		err := db.Conn.QueryRowContext(ctx, "SELECT name,type,url,data, template_id, created FROM datasource WHERE team_id=? and id=?", teamId, id).Scan(&ds.Name, &ds.Type, &ds.URL, &rawdata, &ds.TemplateId, &ds.Created)
		if err != nil {
			return nil, err
		}

		if rawdata != nil {
			err = json.Unmarshal(rawdata, &ds.Data)
		}
		ds.TeamId = teamId
		return ds, err
	}

	return ds, nil
}

func GetDatasourceById(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if id == 0 {
		c.JSON(http.StatusBadRequest, common.RespError("bad datasource id"))
		return
	}

	ds, err := GetDatasource(c.Request.Context(), teamId, id)
	if err != nil {
		logger.Warn("Error query datasource", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(ds))
}
