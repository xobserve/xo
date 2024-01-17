package template

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"
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

	if req.TemplateId == 0 {
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

	if req.ScopeType == common.ScopeTenant || req.ScopeType == common.ScopeTeam {
		// check template is already in website
		var tid int64
		db.Conn.QueryRow("SELECT template_id FROM template_use WHERE scope = ?  and template_id = ?", common.ScopeWebsite, t.Id).Scan(&tid)
		if tid == t.Id {
			c.JSON(400, common.RespError("template already linked in website scope"))
			return
		}
	}

	if req.ScopeType == common.ScopeWebsite {
		// remove tenant and team template link
		_, err = tx.Exec("DELETE FROM template_use WHERE template_id=? and scope in (?,?)", t.Id, common.ScopeTenant, common.ScopeTeam)
		if err != nil {
			logger.Warn("delete template use error", "error", err)
			c.JSON(400, common.RespError(err.Error()))
			return
		}
	} else if req.ScopeType == common.ScopeTenant {
		// remove team template link
		_, err = tx.Exec("DELETE FROM template_use WHERE template_id=? and scope=?", t.Id, common.ScopeTeam)
		if err != nil {
			logger.Warn("delete template use error", "error", err)
			c.JSON(400, common.RespError(err.Error()))
			return
		}
	}

	if req.ScopeType == common.ScopeTeam {
		// check template is already in tenant
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

		var tid int64
		db.Conn.QueryRow("SELECT template_id FROM template_use WHERE scope=? and scope_id=? and template_id=?", common.ScopeTenant, tenantId, t.Id).Scan(&tid)
		if tid == t.Id {
			c.JSON(400, common.RespError("template already linked in tenant scope"))
			return
		}
	}

	if req.Type == models.TemplateCreateClone {
		// clone a template
		if req.ScopeType != common.ScopeTeam {
			c.JSON(400, common.RespError("only team can clone template"))
			return
		}

		// import dashboards
		for _, dash := range templateExport.Dashboards {
			if dash.Title == "" {
				dash.Title = fmt.Sprintf("Clone from %s template %d ", models.TemplateTypeText[t.Scope], t.Id)
			}
			err := models.ImportDashboard(tx, dash, req.ScopeId, u.Id)
			if err != nil {
				if !e.IsErrUniqueConstraint(err) {
					logger.Warn("import dashboard error", "error", err)
					c.JSON(500, common.RespInternalError())
					return
				}

			}
		}

		// import datasources
		for _, ds := range templateExport.Datasources {
			ds.TeamId = req.ScopeId
			err := models.ImportDatasource(c.Request.Context(), ds, tx)
			if err != nil {
				if !e.IsErrUniqueConstraint(err) {
					logger.Warn("import datasource error", "error", err)
					c.JSON(400, common.RespInternalError())
					return
				}
			}
		}

		// import variables
		for _, v := range templateExport.Variables {
			v.TeamId = req.ScopeId
			err := models.ImportVariable(c.Request.Context(), v, tx)
			if err != nil {
				if !e.IsErrUniqueConstraint(err) {
					logger.Warn("import variable error", "error", err)
					c.JSON(400, common.RespInternalError())
					return
				}
			}
		}

		// import sidemenu
		if templateExport.SideMenu != nil {
			err := models.ImportSidemenu(c.Request.Context(), t.Id, req.ScopeId, templateExport.SideMenu, tx)
			if err != nil && !e.IsErrUniqueConstraint(err) {
				logger.Warn("import sidemenu error", "error", err)
				c.JSON(400, common.RespInternalError())
				return
			}
		}
	} else {
		// refer to a template
		_, err = tx.ExecContext(c.Request.Context(), "INSERT INTO template_use (scope,scope_id,template_id,created,created_by) VALUES (?,?,?,?,?)",
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

		err = models.CreateResourcesByTemplateExport(c.Request.Context(), t.Id, templateExport, req.ScopeType, req.ScopeId, u.Id, tx)
		if err != nil {
			if !e.IsErrUniqueConstraint(err) {
				logger.Warn("create dashboard error", "error", err)
				c.JSON(500, common.RespInternalError())
				return
			}
		}
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(fmt.Sprintf("/%d/%s", req.ScopeId, templateExport.Dashboards[0].Id)))
}

func SyncTemplate(c *gin.Context) {
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

	// can only use dashboard and app template
	if t.Type != models.TemplateTypeDashboard && t.Type != models.TemplateTypeApp {
		c.JSON(400, common.RespError("invalid template type"))
		return
	}

	// check permission
	u := c.MustGet("currentUser").(*models.User)

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

	if req.Type == models.TemplateCreateRefer {
		err = models.CreateResourcesByTemplateExport(c.Request.Context(), t.Id, templateExport, req.ScopeType, req.ScopeId, u.Id, tx)
		if err != nil {
			if !e.IsErrUniqueConstraint(err) {
				logger.Warn("create dashboard error", "error", err)
				c.JSON(500, common.RespInternalError())
				return
			}
		}
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(fmt.Sprintf("/%d/%s", req.ScopeId, templateExport.Dashboards[0].Id)))
}
func GetScopeUseTemplates(c *gin.Context) {
	scopeType, _ := strconv.Atoi(c.Param("type"))
	scopeId, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	if scopeType != common.ScopeWebsite && scopeType != common.ScopeTenant && scopeType != common.ScopeTeam {
		c.JSON(400, common.RespError("invalid scope type"))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	var err error
	switch scopeType {
	case common.ScopeWebsite:
		err = acl.CanViewWebsite(u)
	case common.ScopeTenant:
		err = acl.CanViewTenant(c.Request.Context(), scopeId, u.Id)
	case common.ScopeTeam:
		err = acl.CanViewTeam(c.Request.Context(), scopeId, u.Id)
	}

	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	var idsInt []int64
	rows, err := db.Conn.Query("SELECT template_id FROM template_use WHERE scope = ? and scope_id = ?", scopeType, scopeId)
	if err != nil {
		logger.Warn("get templates error", "error", err)
		c.JSON(500, common.RespError(err.Error()))
		return
	}

	for rows.Next() {
		var id int64
		err := rows.Scan(&id)
		if err != nil {
			logger.Warn("scan template id error", "error", err)
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		idsInt = append(idsInt, id)
	}

	usedScope := make(map[int64]int)
	// get inherited templates
	if scopeType == common.ScopeTenant || scopeType == common.ScopeTeam {
		// get website templates
		rows, err = db.Conn.Query("SELECT template_id FROM template_use WHERE scope = ?", common.ScopeWebsite)
		if err != nil {
			logger.Warn("get websilte templates error", "error", err)
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		for rows.Next() {
			var id int64
			err := rows.Scan(&id)
			if err != nil {
				logger.Warn("scan template id error", "error", err)
				c.JSON(400, common.RespError(err.Error()))
				return
			}
			usedScope[id] = common.ScopeWebsite
			idsInt = append(idsInt, id)
		}
		if scopeType == common.ScopeTeam {
			// get tenant templates
			tenantId, err := models.QueryTenantIdByTeamId(c.Request.Context(), scopeId)
			if err != nil {
				logger.Warn("get tenant id error", "error", err)
				c.JSON(400, common.RespError(err.Error()))
				return
			}
			rows, err = db.Conn.Query("SELECT template_id FROM template_use WHERE scope = ? and scope_id = ?", common.ScopeTenant, tenantId)
			if err != nil {
				logger.Warn("get tenant templates error", "error", err)
				c.JSON(400, common.RespError(err.Error()))
				return
			}
			for rows.Next() {
				var id int64
				err := rows.Scan(&id)
				if err != nil {
					logger.Warn("scan template id error", "error", err)
					c.JSON(400, common.RespError(err.Error()))
					return
				}
				usedScope[id] = common.ScopeTenant

				idsInt = append(idsInt, id)
			}
		}
	}

	var ids []string
	for _, id := range idsInt {
		ids = append(ids, strconv.FormatInt(id, 10))
	}

	rows, err = db.Conn.Query(fmt.Sprintf("%s WHERE id in ('%s')", queryTemplatesBasic, strings.Join(ids, "','")))
	if err != nil {
		logger.Warn("get templates error", "error", err)
		c.JSON(500, common.RespError(err.Error()))
		return
	}

	templates, err := getTemplates(c.Request.Context(), rows)
	if err != nil {
		logger.Warn("get templates error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	for _, t := range templates {
		scope, ok := usedScope[t.Id]
		if ok {
			t.Scope = scope
		} else {
			t.Scope = scopeType
		}
		if scopeType == common.ScopeTeam {
			disabled, err := models.GetTemplateDisabled(t.Id, scopeType, scopeId)
			if err != nil {
				logger.Warn("get template disabled error", "error", err)
				c.JSON(400, common.RespError(err.Error()))
				return
			}
			t.Disabled = disabled
		}
	}

	c.JSON(200, common.RespSuccess(templates))
}

func RemoveTemplateUse(c *gin.Context) {
	scopeType, _ := strconv.Atoi(c.Param("scope"))
	scopeId, _ := strconv.ParseInt(c.Param("scopeId"), 10, 64)
	templateId, _ := strconv.ParseInt(c.Param("templateId"), 10, 64)
	removeType := c.Param("removeType")

	if scopeType != common.ScopeWebsite && scopeType != common.ScopeTenant && scopeType != common.ScopeTeam {
		c.JSON(400, common.RespError("invalid scope type"))
		return
	}

	if templateId == 0 {
		c.JSON(400, common.RespError("invalid template id"))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	var err error
	switch scopeType {
	case common.ScopeWebsite:
		err = acl.CanEditWebsite(u)
	case common.ScopeTenant:
		err = acl.CanEditTenant(c.Request.Context(), scopeId, u.Id)
	case common.ScopeTeam:
		err = acl.CanEditTeam(c.Request.Context(), scopeId, u.Id)
	}

	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("new tx error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM template_use WHERE scope=? and scope_id=? and template_id=?", scopeType, scopeId, templateId)
	if err != nil {
		logger.Warn("delete template use error", "error", err)
		c.JSON(500, common.RespError(err.Error()))
		return
	}

	if removeType == "all" {
		// remove dashboards, datasources and variables
		err = models.RemoveTemplateResourcesInScope(c.Request.Context(), tx, scopeType, scopeId, templateId, false)
		if err != nil {
			logger.Warn("remove template resources error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}
	}
	err = tx.Commit()
	if err != nil {
		logger.Warn("commit transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	c.JSON(200, common.RespSuccess(nil))
}
