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
	"net/http"
	"time"

	"github.com/MyStarship/starship/backend/internal/user"
	"github.com/MyStarship/starship/backend/pkg/common"
	"github.com/MyStarship/starship/backend/pkg/db"
	"github.com/MyStarship/starship/backend/pkg/e"
	"github.com/MyStarship/starship/backend/pkg/log"
	"github.com/MyStarship/starship/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

var logger = log.RootLogger.New("logger", "datasource")

func SaveDatasource(c *gin.Context) {
	ds := &models.Datasource{}
	err := c.Bind(&ds)
	if err != nil {
		logger.Warn("save datasource request data error", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError(err.Error()))
		return
	}

	u := user.CurrentUser((c))
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	now := time.Now()
	if ds.Id == 0 {
		// create
		res, err := db.Conn.Exec("INSERT INTO datasource (name,type,url,created,updated) VALUES (?,?,?,?,?)", ds.Name, ds.Type, ds.URL, now, now)
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
	dss := make([]*models.Datasource, 0)
	rows, err := db.Conn.Query("SELECT id,name,type,url, created FROM datasource")
	if err != nil {
		logger.Warn("get datasource error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespInternalError())
		return
	}

	for rows.Next() {
		ds := &models.Datasource{}
		err := rows.Scan(&ds.Id, &ds.Name, &ds.Type, &ds.URL, &ds.Created)
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
	id := c.Param("id")

	if id == "1" {
		c.JSON(http.StatusBadRequest, common.RespError("can not delete default test data datasource"))
		return
	}

	u := user.CurrentUser((c))
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	_, err := db.Conn.Exec("DELETE FROM datasource WHERE id=?", id)
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
