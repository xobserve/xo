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
package dashboard

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/admin"
	"github.com/xObserve/xObserve/query/internal/user"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/config"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/log"
	"github.com/xObserve/xObserve/query/pkg/models"
	"github.com/xObserve/xObserve/query/pkg/utils"
	"go.uber.org/zap"
)

var logger = colorlog.RootLogger.New("logger", "dashboard")

func SaveDashboard(c *gin.Context) {
	u := user.CurrentUser(c)
	req := &models.DashboardHistory{}
	err := c.Bind(&req)
	if err != nil {
		logger.Warn("invalid request in saving dashboard", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	dash := req.Dashboard

	now := time.Now()
	isUpdate := dash.Id != ""
	if !isUpdate { // create dashboard
		dash.Id = "d-" + utils.GenerateShortUID()
		dash.CreatedBy = u.Id
		dash.Created = &now

		if !u.Role.IsAdmin() {
			isTeamAdmin, err := models.IsTeamAdmin(c.Request.Context(), dash.OwnedBy, u.Id)
			if err != nil {
				logger.Error("check team admin error", "error", err)
				c.JSON(500, common.RespInternalError())
				return
			}
			if !isTeamAdmin {
				c.JSON(403, common.RespError(e.NoPermission))
				return
			}
		}
	} else {
		belongs, err := models.QueryDashboardBelongsTo(c.Request.Context(), dash.Id)
		if err != nil {
			logger.Error("query dashboarde owner error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		if !u.Role.IsAdmin() {
			isTeamAdmin, err := models.IsTeamAdmin(c.Request.Context(), belongs, u.Id)
			if err != nil {
				logger.Error("check team admin error", "error", err)
				c.JSON(500, common.RespInternalError())
				return
			}
			if !isTeamAdmin {
				c.JSON(403, common.RespError(e.NoPermission))
				return
			}
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
	if !isUpdate {
		_, err := db.Conn.ExecContext(c.Request.Context(), `INSERT INTO dashboard (id,title, team_id,visible_to, created_by,tags, data,created,updated) VALUES (?,?,?,?,?,?,?,?,?)`,
			dash.Id, dash.Title, dash.OwnedBy, dash.VisibleTo, dash.CreatedBy, tags, jsonData, dash.Created, dash.Updated)
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
		res, err := db.Conn.ExecContext(c.Request.Context(), `UPDATE dashboard SET title=?,tags=?,data=?,team_id=?,visible_to=?,updated=? WHERE id=?`,
			dash.Title, tags, jsonData, dash.OwnedBy, dash.VisibleTo, dash.Updated, dash.Id)
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
	}

	historyCh <- req

	c.JSON(200, common.RespSuccess(dash.Id))
}

func GetDashboard(c *gin.Context) {
	id := c.Param("id")
	u := user.CurrentUser(c)
	traceCtx := c.Request.Context()

	// log.WithTrace(traceCtx).Info("Start to get dashboard", zap.String("id", id), zap.String("username", u.Username))

	dash, err := models.QueryDashboard(c.Request.Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			log.WithTrace(traceCtx).Warn("Error query dashbaord", zap.String("user", getVisitInfo(c, u)), zap.Error(err))
			c.JSON(404, common.RespError(fmt.Sprintf("dashboard id `%s` not found", id)))
			return
		}
		log.WithTrace(traceCtx).Warn("Error query dashbaord", zap.String("user", getVisitInfo(c, u)), zap.Error(err))
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	if config.Data.SelfMonitoring.MockErrorLogs {
		r := rand.Intn(100)
		if r > 70 {
			log.WithTrace(traceCtx).Warn("Mock a warn msg for query dashbaord", zap.String("user", getVisitInfo(c, u)), zap.Error(errors.New("nothing happend, just mock a warn msg")))
		} else if r > 35 {
			log.WithTrace(traceCtx).Error("Mock a error msg for query dashbaord", zap.String("user", getVisitInfo(c, u)), zap.Error(errors.New("nothing happend, just mock a error msg")))
		}

	}

	if dash.OwnedBy != models.GlobalTeamId {
		isTeamPublic, err := models.IsTeamPublic(c.Request.Context(), dash.OwnedBy)

		if err != nil {
			log.WithTrace(traceCtx).Warn("Error check isTeamPublic", zap.String("user", getVisitInfo(c, u)), zap.Error(err))
			c.JSON(500, common.RespError(e.Internal))
			return
		}

		if !isTeamPublic && dash.VisibleTo != "all" {
			if u == nil {
				c.JSON(http.StatusForbidden, common.RespError("you are not the team menber to view this dashboard"))
				return
			}

			if !u.Role.IsAdmin() {
				member, err := models.QueryTeamMember(c.Request.Context(), dash.OwnedBy, u.Id)
				if err != nil {
					log.WithTrace(traceCtx).Warn("Error query team member", zap.String("username", u.Username), zap.Error(err))
					c.JSON(500, common.RespError(e.Internal))
					return
				}
				if member.Id == 0 {
					log.WithTrace(traceCtx).Warn("Error no permission", zap.String("username", u.Username), zap.Error(err))
					c.JSON(http.StatusForbidden, common.RespError("you are not the team menber to view this dashboard"))
					return
				}
			}
		}
	}

	teamName, _ := models.QueryTeamNameById(c.Request.Context(), dash.OwnedBy)
	if teamName == "" {
		teamName = "not_found"
	}
	dash.Editable = true
	dash.OwnerName = teamName

	log.WithTrace(traceCtx).Info("Get dashboard", zap.String("id", dash.Id), zap.String("title", dash.Title), zap.String("user", getVisitInfo(c, u)), zap.String("ip", c.ClientIP()))

	c.JSON(200, common.RespSuccess(dash))
}

func getVisitInfo(c *gin.Context, u *models.User) string {
	if u != nil {
		return u.Username
	}

	return c.ClientIP()
}

func DeleteDashboard(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	for _, rid := range models.ReservedDashboardId {
		if id == rid {
			c.JSON(400, common.RespError("reserved dashboard can not be deleted"))
			return
		}
	}

	// delete dashboard
	_, err := db.Conn.ExecContext(c.Request.Context(), "DELETE FROM dashboard WHERE id=?", id)
	if err != nil {
		logger.Warn("delete dashboard error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func UpdateOwnedBy(c *gin.Context) {
	dash := &models.Dashboard{}
	c.Bind(&dash)

	if dash.Id == "" || dash.OwnedBy == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	// check if the new owner is a valid team
	if !models.IsTeamExist(c.Request.Context(), dash.OwnedBy, "") {
		c.JSON(400, common.RespError("targe team is not exist"))
		return
	}

	// query the team which dashboard originally belongs to
	ownedBy, err := models.QueryDashboardBelongsTo(c.Request.Context(), dash.Id)
	if err != nil {
		logger.Warn("query dashboard belongs to error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	u := user.CurrentUser(c)
	// constrains need to be satisfied:
	// 1. current user must be the admin of the team which dashboard originally belongs to
	isTeamAdmin, err := models.IsTeamAdmin(c.Request.Context(), ownedBy, u.Id)
	if err != nil {
		logger.Error("check team admin error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	if !isTeamAdmin {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE dashboard SET team_id=? WHERE id=?", dash.OwnedBy, dash.Id)
	if err != nil {
		logger.Warn("update dashboard ownedBy error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func GetTeamDashboards(c *gin.Context) {
	teamId := c.Param("id")
	if teamId == "" {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	dashboards := make([]*models.Dashboard, 0)

	rows, err := db.Conn.QueryContext(c.Request.Context(), "SELECT id,title, created, updated FROM dashboard WHERE team_id=?", teamId)
	if err != nil {
		logger.Warn("query team dashboards error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	defer rows.Close()
	for rows.Next() {
		dash := &models.Dashboard{}
		err = rows.Scan(&dash.Id, &dash.Title, &dash.Created, &dash.Updated)
		if err != nil {
			logger.Warn("scan dashboard error", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}

		dashboards = append(dashboards, dash)

	}
	c.JSON(200, common.RespSuccess(dashboards))
}

func GetSimpleList(c *gin.Context) {
	dashboards := make([]*models.Dashboard, 0)

	rows, err := db.Conn.QueryContext(c.Request.Context(), "SELECT dashboard.id,dashboard.title, dashboard.team_id,team.name,dashboard.visible_to, dashboard.tags, dashboard.weight FROM dashboard INNER JOIN team ON dashboard.team_id = team.id ORDER BY dashboard.weight DESC,dashboard.created DESC")
	if err != nil {
		logger.Warn("query simple dashboards error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	defer rows.Close()
	for rows.Next() {
		dash := &models.Dashboard{}
		var rawTags []byte
		err = rows.Scan(&dash.Id, &dash.Title, &dash.OwnedBy, &dash.OwnerName, &dash.VisibleTo, &rawTags, &dash.SortWeight)
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
	id := c.Param("id")
	u := user.CurrentUser(c)
	_, err := db.Conn.ExecContext(c.Request.Context(), "INSERT INTO star_dashboard (user_id, dashboard_id, created) VALUES (?,?,?)", u.Id, id, time.Now())
	if err != nil {
		logger.Warn("star dashboard", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func UnStar(c *gin.Context) {
	id := c.Param("id")
	u := user.CurrentUser(c)
	_, err := db.Conn.ExecContext(c.Request.Context(), "DELETE FROM star_dashboard WHERE user_id=? and dashboard_id=?", u.Id, id)
	if err != nil {
		logger.Warn("unstar dashboard", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetStarred(c *gin.Context) {
	id := c.Param("id")
	u := user.CurrentUser(c)
	if u == nil {
		c.JSON(http.StatusOK, common.RespSuccess(false))
		return
	}

	starred, err := models.QuertyDashboardStared(c.Request.Context(), u.Id, id)
	if err != nil {
		logger.Warn("unstar dashboard", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(starred))
}

func GetAllStarred(c *gin.Context) {
	starredList := make([]string, 0)

	u := user.CurrentUser(c)
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

	id := c.Param("id")
	u := user.CurrentUser(c)

	for _, rid := range models.ReservedDashboardId {
		if id == rid {
			c.JSON(400, common.RespError("reserved dashboard can not be deleted"))
			return
		}
	}

	dash, err := models.QueryDashboard(c.Request.Context(), id)
	if err != nil {
		logger.Warn("query dash belongs to error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	if !u.Role.IsAdmin() {
		isTeamAdmin, err := models.IsTeamAdmin(c.Request.Context(), dash.OwnedBy, u.Id)
		if err != nil {
			logger.Error("check team admin error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
		if !isTeamAdmin {
			c.JSON(403, common.RespError(e.NoPermission))
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

	_, err = tx.ExecContext(c.Request.Context(), "DELETE FROM dashboard WHERE id=?", id)
	if err != nil {
		logger.Warn("delete dashboard erorr", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	_, err = tx.ExecContext(c.Request.Context(), "DELETE FROM star_dashboard WHERE dashboard_id=?", id)
	if err != nil {
		logger.Warn("delete dashboard star erorr", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	_, err = tx.ExecContext(c.Request.Context(), "DELETE FROM annotation WHERE namespace_id=?", id)
	if err != nil {
		logger.Warn("delete dashboard annotations erorr", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit sql transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	admin.WriteAuditLog(c.Request.Context(), u.Id, admin.AuditDeleteDashboard, id, dash)

	c.JSON(200, common.RespSuccess(nil))
}

type DashboardReq struct {
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

	u := user.CurrentUser(c)
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE dashboard SET weight=? WHERE id=?", req.Weight, req.Id)
	if err != nil {
		logger.Warn("update dashboard weight error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}
