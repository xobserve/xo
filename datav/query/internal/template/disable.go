package template

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/acl"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

func DisableTemplate(c *gin.Context) {
	req := &UseTemplateRes{}
	err := c.BindJSON(req)

	if err != nil {
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	if req.TemplateId == 0 {
		c.JSON(400, common.RespError("invalid request"))
		return
	}

	if req.ScopeType != common.ScopeTeam {
		c.JSON(400, common.RespError("invalid scope type"))
		return
	}

	// get template
	t, err := models.QueryTemplateById(c.Request.Context(), req.TemplateId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("template not exist"))
			return
		}
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	// check permission
	u := c.MustGet("currentUser").(*models.User)

	if err := acl.CanEditTeam(c.Request.Context(), req.ScopeId, u.Id); err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("new user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	err = models.RemoveTemplateResourcesInScope(c.Request.Context(), tx, req.ScopeType, req.ScopeId, t.Id, false)
	if err != nil {
		if !e.IsErrUniqueConstraint(err) {
			logger.Warn("create dashboard error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
	}

	_, err = tx.ExecContext(c.Request.Context(), "INSERT INTO template_disable (scope,scope_id,template_id,created,created_by) VALUES (?,?,?,?,?)", req.ScopeType, req.ScopeId, req.TemplateId, time.Now(), u.Id)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError("same template already disabled"))
			return
		}
		logger.Warn("insert template disable error", "error", err)
		c.JSON(500, common.RespError(err.Error()))
		return
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
}

func EnableTemplate(c *gin.Context) {
	req := &UseTemplateRes{}
	err := c.BindJSON(req)

	if err != nil {
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	if req.TemplateId == 0 {
		c.JSON(400, common.RespError("invalid request"))
		return
	}

	if req.ScopeType != common.ScopeTeam {
		c.JSON(400, common.RespError("invalid scope type"))
		return
	}

	// get template
	t, err := models.QueryTemplateById(c.Request.Context(), req.TemplateId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("template not exist"))
			return
		}
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	// check permission
	u := c.MustGet("currentUser").(*models.User)

	if err := acl.CanEditTeam(c.Request.Context(), req.ScopeId, u.Id); err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	// get template content
	templateExport, err := models.QueryTemplateExportByTemplateId(c.Request.Context(), t.ContentId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("template content not exist"))
			return
		}
		logger.Warn("query template export", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("new user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	err = models.CreateResourcesByTemplateExport(c.Request.Context(), t.Id, templateExport, req.ScopeType, req.ScopeId, u.Id, tx)
	if err != nil {
		if !e.IsErrUniqueConstraint(err) {
			logger.Warn("create dashboard error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
	}

	_, err = tx.ExecContext(c.Request.Context(), "DELETE FROM template_disable WHERE scope=? AND scope_id=? AND template_id=?", req.ScopeType, req.ScopeId, req.TemplateId)
	if err != nil {
		logger.Warn("delete template disable error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}
	err = tx.Commit()
	if err != nil {
		logger.Warn("commit transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(fmt.Sprintf("/%d/%s", req.ScopeId, templateExport.Dashboards[0].Id)))
}
