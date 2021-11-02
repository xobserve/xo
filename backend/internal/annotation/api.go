package annotation

import (
	// "fmt"

	"github.com/savecost/datav/backend/internal/acl"
	"github.com/savecost/datav/backend/internal/dashboard"
	"github.com/savecost/datav/backend/internal/session"

	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/savecost/datav/backend/pkg/common"
	"github.com/savecost/datav/backend/pkg/i18n"
	"github.com/savecost/datav/backend/pkg/models"
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
	annRepo := models.GetAnnotationRep()
	ans, err := annRepo.Find(&models.AnnotationQuery{
		DashboardId: dashId,
		From:        from,
		To:          to,
	})

	if err != nil {
		logger.Warn("find annotations  error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
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
	an.CreatedBy = session.CurrentUserId(c)

	annRepo := models.GetAnnotationRep()
	err = annRepo.Create(an)
	if err != nil {
		logger.Warn("create annotation  error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func UpdateAnnotation(c *gin.Context) {
	anId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
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

	if !canManageAnnotation(anId, c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	annRepo := models.GetAnnotationRep()
	err := annRepo.Update(an)
	if err != nil {
		logger.Warn("update annotation  error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func DeleteAnnotation(c *gin.Context) {
	anId, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	if anId == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if !canManageAnnotation(anId, c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	annRepo := models.GetAnnotationRep()
	err := annRepo.Delete(anId)
	if err != nil {
		logger.Warn("delete annotation  error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func canManageAnnotation(anId int64, c *gin.Context) bool {
	an, err := QueryAnnotation(anId)
	if err != nil {
		logger.Warn("query annotation error", "error", err, "annotation_id", anId)
		return false
	}

	if an.CreatedBy == session.CurrentUserId(c) {
		return true
	}

	meta, err := dashboard.QueryDashboardMeta(an.DashboardId)
	if err != nil {
		logger.Warn("query dashboard error", "error", err, "dash_id", an.DashboardId)
		return false
	}

	if acl.CanEditDashboard(an.DashboardId, meta.OwnedBy, c) {
		return true
	}

	return false
}
