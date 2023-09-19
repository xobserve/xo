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
package variables

import (
	"time"

	"github.com/DataObserve/datav/backend/internal/user"
	"github.com/DataObserve/datav/backend/pkg/colorlog"
	"github.com/DataObserve/datav/backend/pkg/common"
	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/DataObserve/datav/backend/pkg/e"
	"github.com/DataObserve/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

var logger = colorlog.RootLogger.New("logger", "variables")

// name VARCHAR(60) PRIMARY KEY NOT NULL,
// type VARCHAR(10) NOT NULL,
// value TEXT,
// external_url VARCHAR(255) DEFAULT ”,
// created DATETIME NOT NULL,
// updated DATETIME NOT NULL
func AddNewVariable(c *gin.Context) {
	v := &models.Variable{}
	err := c.Bind(&v)
	if err != nil {
		logger.Warn("bind variable error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	if !isVariableNameValid(v.Name) {
		logger.Warn("variable name invalid", "name", v.Name)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := user.CurrentUser(c)
	// only admin can do this
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	now := time.Now()
	_, err = db.Conn.Exec("INSERT INTO variable(name,type,value,default_selected,datasource,description,refresh,enableMulti,enableAll,regex,sort,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
		v.Name, v.Type, v.Value, v.Default, v.Datasource, v.Desc, v.Refresh, v.EnableMulti, v.EnableAll, v.Regex, v.SortWeight, now, now)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError("variable name already exists"))
			return
		}
		logger.Warn("insert variable error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	c.JSON(200, common.RespSuccess(nil))
}

func GetVariables() ([]*models.Variable, error) {
	vars := []*models.Variable{}
	rows, err := db.Conn.Query("SELECT id,name,type,value,default_selected,datasource,description,refresh,enableMulti,enableAll,regex,sort FROM variable")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		v := &models.Variable{}
		err = rows.Scan(&v.Id, &v.Name, &v.Type, &v.Value, &v.Default, &v.Datasource, &v.Desc, &v.Refresh, &v.EnableMulti, &v.EnableAll, &v.Regex, &v.SortWeight)
		if err != nil {
			logger.Warn("scan variable error", "error", err)
			continue
		}

		vars = append(vars, v)
	}

	return vars, nil
}

func UpdateVariable(c *gin.Context) {
	v := &models.Variable{}
	err := c.Bind(&v)
	if err != nil {
		logger.Warn("bind variable error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	if !isVariableNameValid(v.Name) {
		logger.Warn("variable name invalid", "name", v.Name)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := user.CurrentUser(c)
	// only admin can do this
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	now := time.Now()
	_, err = db.Conn.Exec("UPDATE variable SET name=?,type=?,value=?,default_selected=?,datasource=?,description=?,refresh=?,enableMulti=?,enableAll=?,regex=?,sort=?,updated=? WHERE id=?",
		v.Name, v.Type, v.Value, v.Default, v.Datasource, v.Desc, v.Refresh, v.EnableMulti, v.EnableAll, v.Regex, v.SortWeight, now, v.Id)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError("variable name already exists"))
			return
		}
		logger.Warn("insert variable error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	c.JSON(200, common.RespSuccess(nil))
}

func DeleteVariable(c *gin.Context) {
	id := c.Param("id")

	u := user.CurrentUser(c)
	// only admin can do this
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	_, err := db.Conn.Exec("DELETE FROM variable WHERE id=?", id)
	if err != nil {
		logger.Warn("delete variable error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

// only allow a-z A-Z 0-9
func isVariableNameValid(name string) bool {
	for _, v := range name {
		if v >= 'a' && v <= 'z' {
			continue
		}
		if v >= 'A' && v <= 'Z' {
			continue
		}
		if v >= '0' && v <= '9' {
			continue
		}

		if v == '-' || v == '_' {
			continue
		}
		return false
	}

	return true
}
