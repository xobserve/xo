package template

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"strconv"

	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/acl"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "template")

func CreateTemplate(c *gin.Context) {
	t := &models.Template{}
	err := c.BindJSON(t)
	if err != nil {
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	err = isTemplateValid(t)
	if err != nil {
		c.JSON(400, common.RespError(err.Error()))
		return
	}
	u := c.MustGet("currentUser").(*models.User)
	err = canEditTemplate(c.Request.Context(), t, u)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	t.Provider = models.CustomTemplateProvider

	err = createTemplate(c.Request.Context(), u.Id, t)
	if err != nil {
		logger.Warn("create template error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}
}

func createTemplate(ctx context.Context, userId int64, t *models.Template) error {
	now := time.Now()
	_, err := db.Conn.ExecContext(ctx, "INSERT INTO template (type,title,description,scope,owned_by,provider,created) VALUES (?,?,?,?,?,?,?)", t.Type, t.Title, t.Description, t.Scope, t.OwnedBy, t.Provider, now)
	if err != nil {
		return err
	}

	return nil
}

// template_id INTEGER NOT NULL,
// content MEDIUMTEXT,
// description VARCHAR(255) NOT NULL,
// created DATETIME NOT NULL,
// created_by INTEGER NOT NULL

func createTemplateContent(ctx context.Context, userId int64, tid int64, desc string, content []byte) error {
	now := time.Now()
	_, err := db.Conn.ExecContext(ctx, "INSERT INTO template_content (template_id,content,description,created,created_by) VALUES (?,?,?,?,?)", tid, content, desc, now, userId)
	if err != nil {
		return err
	}

	return nil
}

func CreateTemplateContent(c *gin.Context) {
	t := &models.TemplateContent{}
	err := c.BindJSON(t)
	if err != nil {
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	if t.Content == "" || t.TemplateId == 0 || t.Description == "" {
		c.JSON(400, common.RespError("invalid template content"))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	oldT, err := models.QueryTemplateById(c.Request.Context(), t.TemplateId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("template not exist"))
			return
		}
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	err = canEditTemplate(c.Request.Context(), oldT, u)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	content, err := json.Marshal(t.Content)
	if err != nil {
		c.JSON(400, common.RespError("content is not valid json format"))
		return
	}

	err = createTemplateContent(c.Request.Context(), u.Id, t.TemplateId, t.Description, content)
	if err != nil {
		logger.Warn("create template content error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}
}

func DeleteTemplate(c *gin.Context) {
	// only user-custom template can be deleted
	// delete template will not delete the dashboard which is created by this template
}

func GetTemplate(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	t, err := models.QueryTemplateById(c.Request.Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("template not exist"))
			return
		}
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	c.JSON(200, common.RespSuccess(t))
}

func isTemplateValid(t *models.Template) error {
	if t.Type != models.TemplateTypeDashboard && t.Type != models.TemplateTypeApp && t.Type != models.TemplateTypePanel {
		return errors.New("invalid template type")
	}
	if t.Scope != common.ScopeWebsite && t.Scope != common.ScopeTenant && t.Scope != common.ScopeTeam {
		return errors.New("invalid template scope")
	}

	if t.Title == "" {
		return errors.New("invalid template")
	}

	return nil
}

func canEditTemplate(ctx context.Context, t *models.Template, u *models.User) error {
	if t.Scope == common.ScopeWebsite {
		return acl.CanEditWebsite(u)
	}

	if t.Scope == common.ScopeTenant {
		return acl.CanEditTenant(ctx, t.OwnedBy, u.Id)
	}

	if t.Scope == common.ScopeTeam {
		return acl.CanEditTeam(ctx, t.OwnedBy, u.Id)
	}

	return nil
}
