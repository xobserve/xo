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
package dashboard

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xobserve/xo/query/internal/accesstoken"
	"github.com/xobserve/xo/query/internal/acl"
	"github.com/xobserve/xo/query/internal/admin"
	"github.com/xobserve/xo/query/internal/user"
	"github.com/xobserve/xo/query/pkg/colorlog"
	"github.com/xobserve/xo/query/pkg/common"
	"github.com/xobserve/xo/query/pkg/config"
	"github.com/xobserve/xo/query/pkg/db"
	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/models"
	"github.com/xobserve/xo/query/pkg/utils"
)

var logger = colorlog.RootLogger.New("logger", "dashboard")

func SaveDashboard(c *gin.Context) {
	req := &models.DashboardHistory{}
	err := c.Bind(&req)
	if err != nil {
		logger.Warn("invalid request in saving dashboard", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	dash := req.Dashboard
	if strings.TrimSpace(dash.Title) == "" {
		c.JSON(400, common.RespError("title is required"))
		return
	}

	now := time.Now()
	if req.IsCreate { // create dashboard
		if dash.Id == "" {
			dash.Id = "d-" + utils.GenerateShortUID()
		}

		dash.Created = &now
	} else {
		err := models.IsDashboardExist(c.Request.Context(), dash.OwnedBy, dash.Id)
		if err != nil {
			logger.Error("query dashboarde owner error", "error", err)
			c.JSON(400, common.RespError("dashboard id not exist"))
			return
		}
	}

	ak := c.GetString("accessToken")
	if ak != "" {
		canManage, err := accesstoken.CanManageTeam(dash.OwnedBy, ak)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		if !canManage {
			c.JSON(403, common.RespError(e.InvalidToken))
			return
		}
	} else {
		u := c.MustGet("currentUser").(*models.User)
		dash.CreatedBy = u.Id
		err = acl.CanEditDashboard(c.Request.Context(), dash, u)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
	}

	dash.Updated = &now

	jsonData, err := dash.Data.Encode()
	if err != nil {
		logger.Warn("decode dashboard data error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	tags, err := json.Marshal(dash.Tags)
	if err != nil {
		logger.Warn("encode tags error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	links, err := json.Marshal(dash.Links)
	if err != nil {
		logger.Warn("encode tags error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	if req.IsCreate {
		_, err := db.Conn.ExecContext(c.Request.Context(), `INSERT INTO dashboard (id,title, team_id,visible_to, created_by,tags, data,links, created,updated) VALUES (?,?,?,?,?,?,?,?,?,?)`,
			dash.Id, dash.Title, dash.OwnedBy, dash.VisibleTo, dash.CreatedBy, tags, jsonData, links, dash.Created, dash.Updated)
		if err != nil {
			if e.IsErrUniqueConstraint(err) {
				c.JSON(409, common.RespError("dashboard id already exists"))
			} else {
				logger.Error("add dashboard error", "error", err)
				c.JSON(500, common.RespInternalError())
			}
			return
		}
	} else {
		var res sql.Result
		var err error
		if dash.TemplateId != 0 { // template dashboard can only edit title, tags, visible_to,tags
			res, err = db.Conn.ExecContext(c.Request.Context(), `UPDATE dashboard SET title=?,tags=?,visible_to=?,links=? WHERE team_id=? and id=?`,
				dash.Title, tags, dash.VisibleTo, links, dash.OwnedBy, dash.Id)
		} else {
			res, err = db.Conn.ExecContext(c.Request.Context(), `UPDATE dashboard SET title=?,tags=?,data=?,visible_to=?,links=?,updated=? WHERE team_id=? and id=?`,
				dash.Title, tags, jsonData, dash.VisibleTo, links, dash.Updated, dash.OwnedBy, dash.Id)
		}
		if err != nil {
			logger.Error("update dashboard error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
		affected, _ := res.RowsAffected()
		if affected == 0 {
			c.JSON(http.StatusBadRequest, common.RespError("dashboard id not exist"))
			return
		}

		if dash.TemplateId != 0 {
			_, err := db.Conn.ExecContext(c.Request.Context(), "INSERT INTO temp_dashboard (id,title,team_id,visible_to,tags,template_id,links) VALUES (?,?,?,?,?,?,?)", dash.Id, dash.Title, dash.OwnedBy, dash.VisibleTo, tags, dash.TemplateId, links)
			if err != nil && !e.IsErrUniqueConstraint(err) {
				logger.Error("insert temp dashboard error", "error", err)
				c.JSON(400, common.RespInternalError())
				return
			}

			if err != nil && e.IsErrUniqueConstraint(err) {
				_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE temp_dashboard SET title=?,tags=?,visible_to=?,links=? WHERE team_id=? and id=?", dash.Title, tags, dash.VisibleTo, dash.Links, dash.OwnedBy, dash.Id)
				if err != nil {
					logger.Error("update dashboard template id error", "error", err)
					c.JSON(500, common.RespInternalError())
					return
				}
			}
		}
	}

	if dash.TemplateId == 0 {
		historyCh <- req
	}

	c.JSON(200, common.RespSuccess(dash.Id))
}

func GetDashboard(c *gin.Context) {
	u := c.MustGet("currentUser").(*models.User)
	dash, err := QueryDashboard(c, u)
	if err != nil {
		logger.Warn("get dashboard error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	c.JSON(200, common.RespSuccess(dash))
}

func QueryDashboard(c *gin.Context, u *models.User) (*models.Dashboard, error) {
	id := c.Param("id")
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if teamId == 0 {
		return nil, errors.New("team id is required")
	}

	dash, err := models.QueryDashboard(c.Request.Context(), teamId, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("dashboard id `%s` not found", id)
		}
		return nil, fmt.Errorf("query dashboard error" + err.Error())
	}

	if dash.VisibleTo == models.TeamVisible {
		if u == nil {
			return nil, errors.New("you are not the team menber to view this dashboard")
		}

		_, err := models.QueryTeamMember(c.Request.Context(), dash.OwnedBy, u.Id)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, errors.New("you are not the team menber to view this dashboard")
			}
			return nil, fmt.Errorf("query team member error: %w", err)
		}

	} else if dash.VisibleTo == models.TenantVisible {
		tenantId, err := models.QueryTenantIdByTeamId(c.Request.Context(), dash.OwnedBy)
		if err != nil {
			return nil, fmt.Errorf("query tenant id error: %w", err)
		}

		// check user is in tenant
		in, err := models.IsUserInTenant(u.Id, tenantId)
		if err != nil {
			return nil, fmt.Errorf("check user in tenant error: %w", err)
		}

		if !in {
			return nil, errors.New("you are not the tenant menber to view this dashboard")
		}
	}

	return dash, nil
}

func GetTeamDashboards(c *gin.Context) {
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

	err := acl.CanViewTeam(c.Request.Context(), teamId, userId)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	dashboards := make([]*models.Dashboard, 0)

	rows, err := db.Conn.QueryContext(c.Request.Context(), "SELECT id,title, created, updated,template_id FROM dashboard WHERE team_id=?", teamId)
	if err != nil {
		logger.Warn("query team dashboards error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	defer rows.Close()
	for rows.Next() {
		dash := &models.Dashboard{}
		err = rows.Scan(&dash.Id, &dash.Title, &dash.Created, &dash.Updated, &dash.TemplateId)
		if err != nil {
			logger.Warn("scan dashboard error", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}

		dashboards = append(dashboards, dash)

	}
	c.JSON(200, common.RespSuccess(dashboards))
}

func Search(c *gin.Context) {
	tenantId, _ := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if tenantId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	if err := acl.CanViewTenant(c.Request.Context(), tenantId, u.Id); err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	accessToken := c.GetString("accessToken")
	teamIds := make([]string, 0)
	dashboards := make([]*models.Dashboard, 0)
	if accessToken != "" {
		ids, err := accesstoken.CanViewTeams(tenantId, accessToken)
		if err != nil {
			logger.Warn("check access token error", "error", err)
			c.JSON(400, common.RespError(e.Internal))
			return
		}
		for _, id := range ids {
			teamIds = append(teamIds, strconv.FormatInt(id, 10))
		}
	} else {
		teams, err := models.QueryVisibleTeamsByUserId(c.Request.Context(), tenantId, u.Id)
		if err != nil {
			logger.Warn("query visible teams error", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}
		for _, team := range teams {
			teamIds = append(teamIds, strconv.FormatInt(team, 10))
		}
	}

	rows, err := db.Conn.QueryContext(c.Request.Context(), fmt.Sprintf("SELECT dashboard.id,dashboard.title, dashboard.team_id,team.name,dashboard.visible_to, dashboard.tags, dashboard.weight,dashboard.template_id FROM dashboard INNER JOIN team ON dashboard.team_id = team.id WHERE dashboard.team_id in ('%s') ORDER BY dashboard.weight DESC,dashboard.created DESC", strings.Join(teamIds, "','")))
	if err != nil {
		logger.Warn("query simple dashboards error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	defer rows.Close()
	for rows.Next() {
		dash := &models.Dashboard{}
		var rawTags []byte
		err = rows.Scan(&dash.Id, &dash.Title, &dash.OwnedBy, &dash.OwnerName, &dash.VisibleTo, &rawTags, &dash.SortWeight, &dash.TemplateId)
		if err != nil {
			logger.Warn("get simple dashboards scan error", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}
		var tags []string
		err = json.Unmarshal(rawTags, &tags)
		if err != nil {
			logger.Warn("get simple dashboards decode tags error", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}
		dash.Tags = tags

		dashboards = append(dashboards, dash)
	}

	c.JSON(http.StatusOK, common.RespSuccess(dashboards))
}

func Star(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	id := c.Param("id")

	u := c.MustGet("currentUser").(*models.User)
	err := models.IsDashboardExist(c.Request.Context(), teamId, id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(404, common.RespError("Dashboard not found"))
			return
		}
		logger.Warn("query dashboard belongs to error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	if err := acl.CanViewTeam(c.Request.Context(), teamId, u.Id); err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "INSERT INTO star_dashboard (user_id, team_id, dashboard_id, created) VALUES (?,?,?,?)", u.Id, teamId, id, time.Now())
	if err != nil {
		logger.Warn("star dashboard", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func UnStar(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	id := c.Param("id")

	u := c.MustGet("currentUser").(*models.User)
	_, err := db.Conn.ExecContext(c.Request.Context(), "DELETE FROM star_dashboard WHERE user_id=? and team_id=? and dashboard_id=?", u.Id, teamId, id)
	if err != nil {
		logger.Warn("unstar dashboard", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetStarred(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	id := c.Param("id")

	u := user.CurrentUser(c)
	if u == nil {
		c.JSON(http.StatusOK, common.RespSuccess(false))
		return
	}

	starred, err := models.QuertyDashboardStared(c.Request.Context(), u.Id, teamId, id)
	if err != nil {
		logger.Warn("unstar dashboard", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(starred))
}

func GetAllStarred(c *gin.Context) {
	starredList := make([]string, 0)

	u := c.MustGet("currentUser").(*models.User)
	if u == nil {
		c.JSON(http.StatusOK, common.RespSuccess(starredList))
		return
	}

	rows, err := db.Conn.QueryContext(c.Request.Context(), "SELECT dashboard_id FROM star_dashboard WHERE user_id=?", u.Id)
	if err != nil {
		logger.Warn("get all starred dashboard error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	defer rows.Close()

	for rows.Next() {
		var id string
		err = rows.Scan(&id)
		if err != nil {
			logger.Warn("get all starred scan error", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}

		starredList = append(starredList, id)
	}

	c.JSON(http.StatusOK, common.RespSuccess(starredList))
}

func Delete(c *gin.Context) {
	if !config.Data.Dashboard.EnableDelete {
		c.JSON(http.StatusForbidden, common.RespError("Deleting dashboard is disabled in xobserve config"))
		return
	}

	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	id := c.Param("id")

	dash, err := models.QueryDashboard(c.Request.Context(), teamId, id)
	if err != nil {
		logger.Warn("query dash belongs to error", "error", err)
		c.JSON(400, common.RespError(e.Internal))
		return
	}

	var uid int64 = 0
	ak := c.GetString("accessToken")
	if ak != "" {
		canManage, err := accesstoken.CanManageTeam(dash.OwnedBy, ak)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		if !canManage {
			c.JSON(403, common.RespError(e.InvalidToken))
			return
		}
	} else {
		u := c.MustGet("currentUser").(*models.User)
		uid = u.Id
		err = acl.CanEditDashboard(c.Request.Context(), dash, u)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
	}

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("start sql transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	err = models.DeleteDashboard(c.Request.Context(), teamId, id, tx)
	if err != nil {
		logger.Warn("delete dashboard error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit sql transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	tenantId, _ := models.QueryTenantIdByTeamId(c.Request.Context(), teamId)

	admin.WriteAuditLog(c.Request.Context(), tenantId, teamId, uid, admin.AuditDeleteDashboard, id, dash)

	c.JSON(200, common.RespSuccess(nil))
}

type DashboardReq struct {
	TeamId int64  `json:"teamId"`
	Id     string `json:"id"`
	Weight int    `json:"weight"`
}

func UpdateWeight(c *gin.Context) {
	req := &DashboardReq{}
	err := c.Bind(req)
	if err != nil {
		logger.Warn("update dashboard weight bind error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	err = models.IsDashboardExist(c.Request.Context(), req.TeamId, req.Id)
	if err != nil {
		logger.Warn("query dashboard belongs to error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	tenantId, err := models.QueryTenantIdByTeamId(c.Request.Context(), req.TeamId)
	if err != nil {
		logger.Warn("query tenant id error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	err = acl.CanEditTenant(c.Request.Context(), tenantId, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE dashboard SET weight=? WHERE  team_id=? and id=?", req.Weight, req.TeamId, req.Id)
	if err != nil {
		logger.Warn("update dashboard weight error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}
