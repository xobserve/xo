package annotation

import (
	// "fmt"
	"time"

	"github.com/apm-ai/datav/backend/internal/acl"
	"github.com/apm-ai/datav/backend/internal/dashboard"
	"github.com/apm-ai/datav/backend/internal/session"
	"github.com/apm-ai/datav/backend/pkg/db"

	"strconv"

	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

type GetAnnotationReq struct {
	DashId int64 `json:"dashboardId"`
	From   int64 `json:"from"`
	To     int64 `json:"to"`
}

func GetAnnotations(c *gin.Context) {
	dashId, _ := strconv.ParseInt(c.Query("dashboardId"), 10, 64)
	from, _ := strconv.ParseInt(c.Query("from"), 10, 64)
	to, _ := strconv.ParseInt(c.Query("to"), 10, 64)

	if dashId == 0 || from == 0 || to == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	ans := make([]*models.Annotation,0)
	rows, err := db.SQL.Query("SELECT id,panel_id,text,time,time_end FROM annotation WHERE dashboard_id=? and time >= ? and time <= ?",
		dashId, from, to)
	if err != nil {
		logger.Warn("query annotations error", "error", err)
		c.JSON(500, common.ResponseInternalError())

		return
	}

	for rows.Next() {
		an := &models.Annotation{}
		err := rows.Scan(&an.Id, &an.PanelId, &an.Text, &an.Time, &an.TimeEnd)
		if err != nil {
			logger.Warn("query annotations scan error", "error", err)
			continue
		}
		ans= append(ans,an)
	}

	c.JSON(200, common.ResponseSuccess(ans))
}

func CreateAnnotation(c *gin.Context) {
	an := &models.Annotation{}
	c.Bind(&an)

	if an.DashboardId == 0 || an.Text == "" {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	meta, err := dashboard.QueryDashboardMeta(an.DashboardId)
	if err != nil {
		logger.Warn("query dashboard meta error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	if !acl.CanViewDashboard(an.DashboardId, meta.OwnedBy, c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	now := time.Now()
	_, err = db.SQL.Exec("INSERT INTO annotation (dashboard_id, panel_id, text, time, time_end, created_by, created,updated) VALUES (?,?,?,?,?,?,?,?)",
		an.DashboardId, an.PanelId, an.Text, an.Time, an.TimeEnd, session.CurrentUserId(c), now, now)
	if err != nil {
		logger.Warn("create annotation  error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}


func UpdateAnnotation(c *gin.Context) {
	anId,_ := strconv.ParseInt(c.Param("id"),10,64)
	an := &models.Annotation{}
	c.Bind(&an)

	if anId == 0 || an.Id == 0 || an.Text == "" {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}
	if anId != an.Id {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if !canManageAnnotation(anId,c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	now := time.Now()
	_, err := db.SQL.Exec("UPDATE annotation SET text=?, updated=? WHERE id=?",an.Text,now,an.Id)
	if err != nil {
		logger.Warn("update annotation  error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func DeleteAnnotation(c *gin.Context) {
	anId,_ := strconv.ParseInt(c.Param("id"),10,64)

	if anId == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if !canManageAnnotation(anId,c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	_, err := db.SQL.Exec("DELETE FROM annotation WHERE id=?",anId)
	if err != nil {
		logger.Warn("delete annotation  error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}


func canManageAnnotation(anId int64,c *gin.Context) bool {
	an,err := QueryAnnotation(anId)
	if err != nil {
		logger.Warn("query annotation error","error",err,"annotation_id",anId)
		return false
	}

	
	if an.CreatedBy == session.CurrentUserId(c) {
		return true
	}

	meta,err := dashboard.QueryDashboardMeta(an.DashboardId)
	if err != nil {
		logger.Warn("query dashboard error","error",err,"dash_id",an.DashboardId)
		return false
	}

	if acl.CanEditDashboard(an.DashboardId,meta.OwnedBy,c) {
		return true
	}

	return false
}