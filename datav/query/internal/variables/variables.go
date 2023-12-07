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
package variables

import (
	"context"
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/acl"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
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

	u := c.MustGet("currentUser").(*models.User)
	// only admin or team admin can do this
	err = acl.CanEditTeam(c.Request.Context(), v.TeamId, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	now := time.Now()
	_, err = db.Conn.ExecContext(c.Request.Context(), "INSERT INTO variable(name,type,value,default_selected,datasource,description,refresh,enableMulti,enableAll,regex,sort,team_id,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
		v.Name, v.Type, v.Value, v.Default, v.Datasource, v.Desc, v.Refresh, v.EnableMulti, v.EnableAll, v.Regex, v.SortWeight, v.TeamId, now, now)
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

func GetTeamVariables(ctx context.Context, teamId int64) ([]*models.Variable, error) {
	var rows *sql.Rows
	var err error
	vars := []*models.Variable{}
	if teamId == 0 {
		rows, err = db.Conn.QueryContext(ctx, "SELECT id,name,type,value,default_selected,datasource,description,refresh,enableMulti,enableAll,regex,sort,team_id FROM variable")

	} else {
		rows, err = db.Conn.QueryContext(ctx, "SELECT id,name,type,value,default_selected,datasource,description,refresh,enableMulti,enableAll,regex,sort,team_id FROM variable WHERE team_id=?", teamId)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		v := &models.Variable{}
		err = rows.Scan(&v.Id, &v.Name, &v.Type, &v.Value, &v.Default, &v.Datasource, &v.Desc, &v.Refresh, &v.EnableMulti, &v.EnableAll, &v.Regex, &v.SortWeight, &v.TeamId)
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

	u := c.MustGet("currentUser").(*models.User)
	// only admin can do this
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	now := time.Now()
	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE variable SET name=?,type=?,value=?,default_selected=?,datasource=?,description=?,refresh=?,enableMulti=?,enableAll=?,regex=?,sort=?,updated=? WHERE id=?",
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
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if id == 0 {
		c.JSON(http.StatusBadRequest, common.RespError("bad variable id"))
		return
	}

	teamId, err := getVariableTeamId(c.Request.Context(), id)
	if err != nil {
		logger.Warn("Error query variable team id", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	err = acl.CanEditTeam(c.Request.Context(), teamId, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "DELETE FROM variable WHERE id=?", id)
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

func getVariableTeamId(ctx context.Context, id int64) (int64, error) {
	var teamId int64
	err := db.Conn.QueryRowContext(ctx, "SELECT team_id FROM variable WHERE id=?", id).Scan(&teamId)
	if err != nil {
		return 0, err
	}

	return teamId, nil
}

func QueryTeamVariables(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Query("teamId"), 10, 64)
	u := c.MustGet("currentUser").(*models.User)

	// check user is in this team
	_, err := models.QueryTeamMember(c.Request.Context(), teamId, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(403, common.RespError(e.NotTeamMember))
			return
		}
		logger.Warn("query team member error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	vars, err := GetTeamVariables(c.Request.Context(), teamId)
	if err != nil {
		logger.Warn("query variables error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(200, common.RespSuccess(vars))
}
