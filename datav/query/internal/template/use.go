package template

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/acl"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

type UseTemplateRes struct {
	ScopeId    int64  `json:"scopeId"`
	ScopeType  int    `json:"scopeType"`
	TemplateId int64  `json:"templateId"`
	Type       string `json:"type"`
}

func UseTemplate(c *gin.Context) {
	req := &UseTemplateRes{}
	err := c.BindJSON(req)
	if err != nil {
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	if req.TemplateId == 0 || req.ScopeId == 0 {
		c.JSON(400, common.RespError("invalid request"))
		return
	}

	if req.ScopeType != common.ScopeWebsite && req.ScopeType != common.ScopeTenant && req.ScopeType != common.ScopeTeam {
		c.JSON(400, common.RespError("invalid scope type"))
		return
	}

	if req.Type != models.TemplateCreateClone && req.Type != models.TemplateCreateRefer {
		c.JSON(400, common.RespError("invalid create type"))
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

	// can only use dashboard and app template
	if t.Type != models.TemplateTypeDashboard && t.Type != models.TemplateTypeApp {
		c.JSON(400, common.RespError("invalid template type"))
		return
	}

	// check permission
	u := c.MustGet("currentUser").(*models.User)
	//website scope can only use website template
	if req.ScopeType == common.ScopeWebsite {
		if t.Scope != common.ScopeWebsite {
			c.JSON(400, common.RespError("invalid template scope"))
			return
		}

		if err := acl.CanEditWebsite(u); err != nil {
			c.JSON(403, common.RespError(err.Error()))
			return
		}
	}

	// tenant scope can only use website and tenant template
	if req.ScopeType == common.ScopeTenant {
		if t.Scope == common.ScopeTeam {
			// tenant scope cant use team template
			c.JSON(400, common.RespError("invalid template scope"))
			return
		}

		if t.Scope != common.ScopeWebsite {
			if t.OwnedBy != req.ScopeId {
				c.JSON(400, common.RespError("invalid template scope"))
				return
			}
		}

		if err := acl.CanEditTenant(c.Request.Context(), req.ScopeId, u.Id); err != nil {
			c.JSON(403, common.RespError(err.Error()))
			return
		}
		return
	}

	// team scope can use website, tenant and team template
	if req.ScopeType == common.ScopeTeam {
		if t.Scope != common.ScopeWebsite {
			if t.Scope == common.ScopeTenant {
				// check if the team is in the tenant
				tenantId, err := models.QueryTenantIdByTeamId(c.Request.Context(), req.ScopeId)
				if err != nil {
					if err == sql.ErrNoRows {
						c.JSON(400, common.RespError("the tenant which you are visiting is not exist"))
						return
					}
					logger.Warn("get tenant id error", "error", err)
					c.JSON(500, common.RespError(err.Error()))
					return
				}

				if tenantId != t.OwnedBy {
					c.JSON(400, common.RespError("invalid template scope"))
					return
				}
			}

			// not the same team
			if t.OwnedBy != req.ScopeId {
				c.JSON(400, common.RespError("invalid template scope"))
				return
			}
		}

		if err := acl.CanEditTeam(c.Request.Context(), req.ScopeId, u.Id); err != nil {
			c.JSON(403, common.RespError(err.Error()))
			return
		}
	}

	if req.Type == models.TemplateCreateClone {
		if req.ScopeType != common.ScopeTeam {
			c.JSON(400, common.RespError("only team can clone template"))
			return
		}
		// clone a template
		// get template content
		content, err := models.QueryTemplateContentBytes(c.Request.Context(), t.ContentId)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}

		var temp string
		err = json.Unmarshal(content, &temp)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		var templateExport *models.TemplateExport
		err = json.Unmarshal([]byte(temp), &templateExport)
		if err != nil {
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

		for _, dash := range templateExport.Dashboards {
			if dash.Title == "" {
				dash.Title = fmt.Sprintf("Clone from %s template %d ", models.TemplateTypeText[t.Scope], t.Id)
			}
			err := models.ImportDashboard(tx, dash, req.ScopeId, u.Id)
			if err != nil {
				if e.IsErrUniqueConstraint(err) {
					c.JSON(400, common.RespError("same dashboard id already exist"))
					return
				}
				logger.Warn("import dashboard error", "error", err)
				c.JSON(500, common.RespInternalError())
				return
			}
		}
		// import template content

		err = tx.Commit()
		if err != nil {
			logger.Warn("commit transaction error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
	} else {
		// refer to a template
		_, err = db.Conn.ExecContext(c.Request.Context(), "INSERT INTO template_use (scope,scope_id,template_id,created,created_by) VALUES (?,?,?,?,?)",
			req.ScopeType, req.ScopeId, req.TemplateId, time.Now(), u.Id)
		if err != nil {
			if e.IsErrUniqueConstraint(err) {
				c.JSON(400, common.RespError("same template already used"))
				return
			}
			logger.Warn("insert template use error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}
	}

}
