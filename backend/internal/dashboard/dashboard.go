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
package dashboard

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/DataObserve/datav/backend/internal/admin"
	ot "github.com/DataObserve/datav/backend/internal/opentelemetry"
	"github.com/DataObserve/datav/backend/internal/user"
	"github.com/DataObserve/datav/backend/pkg/colorlog"
	"github.com/DataObserve/datav/backend/pkg/common"
	"github.com/DataObserve/datav/backend/pkg/config"
	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/DataObserve/datav/backend/pkg/e"
	"github.com/DataObserve/datav/backend/pkg/log"
	"github.com/DataObserve/datav/backend/pkg/models"
	"github.com/DataObserve/datav/backend/pkg/utils"
	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
	"go.opentelemetry.io/otel/trace"
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
			isTeamAdmin, err := models.IsTeamAdmin(dash.OwnedBy, u.Id)
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
		belongs, err := models.QueryDashboardBelongsTo(dash.Id)
		if err != nil {
			logger.Error("query dashboarde owner error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		if !u.Role.IsAdmin() {
			isTeamAdmin, err := models.IsTeamAdmin(belongs, u.Id)
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
		_, err := db.Conn.Exec(`INSERT INTO dashboard (id,title, owned_by,visible_to, created_by,tags, data,created,updated) VALUES (?,?,?,?,?,?,?,?,?)`,
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
		res, err := db.Conn.Exec(`UPDATE dashboard SET title=?,tags=?,data=?,owned_by=?,visible_to=?,updated=? WHERE id=?`,
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
	_, span := ot.Tracer.Start(traceCtx, "getDashboard", trace.WithSpanKind(trace.SpanKindClient))
	span.SetAttributes(
		semconv.PeerServiceKey.String("mysql"),
		attribute.
			Key("sql.query").
			String(fmt.Sprintf("SELECT * FROM dashboard WHERE id=%s", id)),
	)

	// log.WithTrace(traceCtx).Info("Start to get dashboard", zap.String("id", id), zap.String("username", u.Username))

	dash, err := models.QueryDashboard(id)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.End()
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

	span.End()

	_, span2 := ot.Tracer.Start(traceCtx, "checkTeamPublic", trace.WithSpanKind(trace.SpanKindClient))
	isTeamPublic, err := models.IsTeamPublic(dash.OwnedBy)
	if err != nil {
		span2.SetStatus(codes.Error, err.Error())
		span2.End()
		log.WithTrace(traceCtx).Warn("Error check isTeamPublic", zap.String("user", getVisitInfo(c, u)), zap.Error(err))
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	span2.End()

	if !isTeamPublic && dash.VisibleTo != "all" {
		if u == nil {
			c.JSON(http.StatusForbidden, common.RespError("you are not the team menber to view this dashboard"))
			return
		}

		if !u.Role.IsAdmin() {
			_, span0 := ot.Tracer.Start(traceCtx, "checkUserPrivilege", trace.WithSpanKind(trace.SpanKindClient))
			member, err := models.QueryTeamMember(dash.OwnedBy, u.Id)
			if err != nil {
				log.WithTrace(traceCtx).Warn("Error query team member", zap.String("username", u.Username), zap.Error(err))
				c.JSON(500, common.RespError(e.Internal))
				span0.SetStatus(codes.Error, err.Error())
				span0.End()
				return
			}
			if member.Id == 0 {
				log.WithTrace(traceCtx).Warn("Error no permission", zap.String("username", u.Username), zap.Error(err))
				c.JSON(http.StatusForbidden, common.RespError("you are not the team menber to view this dashboard"))
				span0.SetStatus(codes.Error, "no permission")
				span0.End()
				return
			}
			span0.End()
		}
	}

	_, span1 := ot.Tracer.Start(traceCtx, "getTeam", trace.WithSpanKind(trace.SpanKindClient))
	defer span1.End()
	span1.SetAttributes(
		semconv.PeerServiceKey.String("mysql"),
		attribute.
			Key("sql.query").
			String(fmt.Sprintf("SELECT name FROM team WHERE id=%d", dash.OwnedBy)),
	)
	teamName, _ := models.QueryTeamNameById(dash.OwnedBy)
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
	_, err := db.Conn.Exec("DELETE FROM dashboard WHERE id=?", id)
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
	if !models.IsTeamExist(dash.OwnedBy, "") {
		c.JSON(400, common.RespError("targe team is not exist"))
		return
	}

	// query the team which dashboard originally belongs to
	ownedBy, err := models.QueryDashboardBelongsTo(dash.Id)
	if err != nil {
		logger.Warn("query dashboard belongs to error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	u := user.CurrentUser(c)
	// constrains need to be satisfied:
	// 1. current user must be the admin of the team which dashboard originally belongs to
	isTeamAdmin, err := models.IsTeamAdmin(ownedBy, u.Id)
	if err != nil {
		logger.Error("check team admin error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	if !isTeamAdmin {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	_, err = db.Conn.Exec("UPDATE dashboard SET owned_by=? WHERE id=?", dash.OwnedBy, dash.Id)
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

	rows, err := db.Conn.Query("SELECT id,title, created, updated FROM dashboard WHERE owned_by=?", teamId)
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

	_, span := ot.Tracer.Start(c.Request.Context(), "getDashboardList", trace.WithSpanKind(trace.SpanKindClient))
	defer span.End()
	span.SetAttributes(
		semconv.PeerServiceKey.String("mysql"),
		attribute.
			Key("sql.query").
			String("SELECT * FROM dashboard"),
	)

	rows, err := db.Conn.Query("SELECT dashboard.id,dashboard.title, dashboard.owned_by,team.name,dashboard.visible_to, dashboard.tags, dashboard.weight FROM dashboard INNER JOIN team ON dashboard.owned_by = team.id ORDER BY dashboard.weight DESC,dashboard.created DESC")
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
	_, err := db.Conn.Exec("INSERT INTO star_dashboard (user_id, dashboard_id, created) VALUES (?,?,?)", u.Id, id, time.Now())
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
	_, err := db.Conn.Exec("DELETE FROM star_dashboard WHERE user_id=? and dashboard_id=?", u.Id, id)
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

	starred, err := models.QuertyDashboardStared(u.Id, id)
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

	rows, err := db.Conn.Query("SELECT dashboard_id FROM star_dashboard WHERE user_id=?", u.Id)
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
		c.JSON(http.StatusForbidden, common.RespError("Deleting dashboard is disabled in datav config"))
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

	dash, err := models.QueryDashboard(id)
	if err != nil {
		logger.Warn("query dash belongs to error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	if !u.Role.IsAdmin() {
		isTeamAdmin, err := models.IsTeamAdmin(dash.OwnedBy, u.Id)
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

	_, err = tx.Exec("DELETE FROM dashboard WHERE id=?", id)
	if err != nil {
		logger.Warn("delete dashboard erorr", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	_, err = tx.Exec("DELETE FROM star_dashboard WHERE dashboard_id=?", id)
	if err != nil {
		logger.Warn("delete dashboard star erorr", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	_, err = tx.Exec("DELETE FROM annotation WHERE namespace_id=?", id)
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

	admin.WriteAuditLog(u.Id, admin.AuditDeleteDashboard, id, dash)

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

	_, err = db.Conn.Exec("UPDATE dashboard SET weight=? WHERE id=?", req.Weight, req.Id)
	if err != nil {
		logger.Warn("update dashboard weight error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}
