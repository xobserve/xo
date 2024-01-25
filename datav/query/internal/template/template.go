package template

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"time"

	b64 "encoding/base64"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/acl"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
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

	if t.Id != 0 {
		oldT, err := models.QueryTemplateById(c.Request.Context(), t.Id)
		if err != nil && err != sql.ErrNoRows {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		if oldT != nil {
			c.JSON(400, common.RespError("id alread exist"))
			return
		}
	}

	u := c.MustGet("currentUser").(*models.User)
	err = canEditTemplate(c.Request.Context(), t, u)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	t.Provider = models.CustomTemplateProvider

	t.Description = b64.StdEncoding.EncodeToString([]byte(t.Description))

	err = createTemplate(c.Request.Context(), u.Id, t)

	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError("template title already exist in this scope"))
			return
		}

		logger.Warn("save template error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}
}

func UpdateTemplate(c *gin.Context) {
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

	oldT, err := models.QueryTemplateById(c.Request.Context(), t.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("template not exist"))
		}
		c.JSON(400, common.RespError(err.Error()))
		return

	}

	t.Scope = oldT.Scope
	t.OwnedBy = oldT.OwnedBy

	u := c.MustGet("currentUser").(*models.User)
	err = canEditTemplate(c.Request.Context(), t, u)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	t.Provider = models.CustomTemplateProvider

	t.Description = b64.StdEncoding.EncodeToString([]byte(t.Description))

	err = updateTemplate(c.Request.Context(), u.Id, t)

	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError("template title already exist in this scope"))
			return
		}

		logger.Warn("save template error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}
}

func createTemplate(ctx context.Context, userId int64, t *models.Template) error {
	tags, err := json.Marshal(t.Tags)
	if err != nil {
		return errors.New("invalid template tags:" + err.Error())
	}

	now := time.Now()
	if t.Id != 0 {
		_, err = db.Conn.ExecContext(ctx, "INSERT INTO template (id,type,title,description,scope,owned_by,provider,tags,created) VALUES (?,?,?,?,?,?,?,?,?)", t.Id, t.Type, t.Title, t.Description, t.Scope, t.OwnedBy, t.Provider, tags, now)
	} else {
		_, err = db.Conn.ExecContext(ctx, "INSERT INTO template (type,title,description,scope,owned_by,provider,tags,created) VALUES (?,?,?,?,?,?,?,?)", t.Type, t.Title, t.Description, t.Scope, t.OwnedBy, t.Provider, tags, now)
	}
	if err != nil {
		return err
	}

	return nil
}

func updateTemplate(ctx context.Context, userId int64, t *models.Template) error {
	tags, err := json.Marshal(t.Tags)
	if err != nil {
		return errors.New("invalid template tags:" + err.Error())
	}

	now := time.Now()
	_, err = db.Conn.ExecContext(ctx, "UPDATE template SET title=?,description=?,tags=?,updated=? WHERE id=?", t.Title, t.Description, tags, now, t.Id)
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

func createTemplateContent(ctx context.Context, userId int64, tid int64, desc string, content []byte, version string) error {
	now := time.Now()
	_, err := db.Conn.ExecContext(ctx, "INSERT INTO template_content (template_id,content,description,version,created,created_by) VALUES (?,?,?,?,?,?)", tid, content, desc, version, now, userId)
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

	if t.Content == "" || t.TemplateId == 0 || t.Description == "" || t.Version == "" {
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

	err = createTemplateContent(c.Request.Context(), u.Id, t.TemplateId, t.Description, content, t.Version)
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

const queryTemplatesBasic = "SELECT id,type,title,description,scope,owned_by,provider,content_id,tags, created FROM template "

func GetTemplates(c *gin.Context) {
	templateType, _ := strconv.Atoi(c.Param("templateType"))
	scopeType, _ := strconv.Atoi(c.Param("scope"))
	scopeId, _ := strconv.ParseInt(c.Param("scopeId"), 10, 64)

	if templateType != models.TemplateTypeDashboard && templateType != models.TemplateTypeApp && templateType != models.TemplateTypePanel {
		c.JSON(400, common.RespError("invalid template type"))
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
	default:
		err = errors.New("invalid scope type")
	}

	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	var rows *sql.Rows
	if scopeType == common.ScopeTeam {
		tenantId, err := models.QueryTenantIdByTeamId(c.Request.Context(), scopeId)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(400, common.RespError("the tenant which you are visiting is not exist"))
				return
			}
			logger.Warn("get tenant id error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}

		rows, err = db.Conn.Query(queryTemplatesBasic+"WHERE type=? and (scope=? or (scope=? and owned_by=?) or (scope=? and owned_by=?))", templateType, common.ScopeWebsite, common.ScopeTenant, tenantId, common.ScopeTeam, scopeId)
		if err != nil {
			logger.Warn("get templates error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}
	} else if scopeType == common.ScopeTenant {
		rows, err = db.Conn.Query(queryTemplatesBasic+"WHERE type=? and (scope=? or (scope=? and owned_by=?))", templateType, common.ScopeWebsite, common.ScopeTenant, scopeId)
		if err != nil {
			logger.Warn("get templates error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}
	} else {
		rows, err = db.Conn.Query(queryTemplatesBasic+"WHERE type=? and scope=?", templateType, common.ScopeWebsite)
		if err != nil {
			logger.Warn("get templates error", "error", err)
			c.JSON(500, common.RespError(err.Error()))
			return
		}
	}

	templates, err := getTemplates(c.Request.Context(), rows)
	if err != nil {
		logger.Warn("get templates error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	c.JSON(200, common.RespSuccess(templates))
}

func getTemplates(ctx context.Context, rows *sql.Rows) ([]*models.Template, error) {
	templates := make([]*models.Template, 0)
	for rows.Next() {
		t := &models.Template{}
		var desc string
		var tags []byte
		err := rows.Scan(&t.Id, &t.Type, &t.Title, &desc, &t.Scope, &t.OwnedBy, &t.Provider, &t.ContentId, &tags, &t.Created)
		if err != nil {
			return nil, fmt.Errorf("scan template error: %w", err)
		}

		b, _ := b64.StdEncoding.DecodeString(desc)
		t.Description = string(b)

		if t.ContentId != 0 {
			v, err := models.QueryTemplateVersion(ctx, t.ContentId)
			if err != nil {
				return nil, fmt.Errorf("get template version error: %w", err)
			}
			t.Version = v
		}

		if tags != nil {
			err = json.Unmarshal(tags, &t.Tags)
			if err != nil {
				logger.Warn("unmarshal template tags error", "error", err)
			}
		}

		templates = append(templates, t)
	}

	return templates, nil
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

func GetScopeTemplates(c *gin.Context) {
	scopeType, _ := strconv.Atoi(c.Param("type"))
	scopeId, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	if scopeType != common.ScopeWebsite && scopeType != common.ScopeTenant && scopeType != common.ScopeTeam {
		c.JSON(400, common.RespError("invalid scope type"))
		return
	}

	if scopeId == 0 {
		c.JSON(400, common.RespError("invalid scope id"))
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

	var cond string
	if scopeType == common.ScopeWebsite {
		cond = fmt.Sprintf("WHERE scope='%d'", scopeType)
	} else {
		cond = fmt.Sprintf("WHERE scope='%d' and owned_by='%d'", scopeType, scopeId)
	}

	rows, err := db.Conn.Query(fmt.Sprintf("%s %s", queryTemplatesBasic, cond))
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

	c.JSON(200, common.RespSuccess(templates))
}

func ExportTeamAsTemplate(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if teamId == 0 {
		c.JSON(400, common.RespError("invalid team id"))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	err := acl.CanEditTeam(c.Request.Context(), teamId, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	// get team use template
	templates, err := models.QueryTeamUseTemplates(teamId)
	if err != nil {
		logger.Warn("get team use templates error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}
	if len(templates) > 0 {
		c.JSON(400, common.RespError("team which is using templates can not be exported"))
		return
	}

	// get team dashboards
	dashboards, err := models.QueryDashboardsByTeamId(c.Request.Context(), teamId)
	if err != nil {
		logger.Warn("get dashboards error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	// get sidemenu
	sidemenu, err := models.QuerySideMenu(c.Request.Context(), teamId, nil)
	if err != nil {
		logger.Warn("get sidemenu error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	c.JSON(200, common.RespSuccess(map[string]interface{}{
		"dashboards": dashboards,
		"sidemenu":   sidemenu.Data,
	}))
}

func UnlinkDashboardTemplate(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	dashId := c.Param("id")
	if dashId == "" || teamId == 0 {
		c.JSON(400, common.RespError("invalid dashboard id"))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	dash, err := models.QueryDashboard(c.Request.Context(), teamId, dashId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("dashboard not exist"))
			return
		}
		logger.Warn("get dashboard error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	err = acl.CanEditTeam(c.Request.Context(), dash.OwnedBy, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE dashboard SET template_id=0 WHERE team_id=? and id=?", teamId, dashId)
	if err != nil {
		logger.Warn("unlink dashboard template error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}
}

func UnlinkDatasourceTemplate(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	dsId, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	if dsId == 0 || teamId == 0 {
		c.JSON(400, common.RespError("invalid datasource id"))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	err := acl.CanEditTeam(c.Request.Context(), teamId, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE datasource SET template_id=0 WHERE team_id=? and id=?", teamId, dsId)
	if err != nil {
		logger.Warn("unlink datasource template error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}
}

func UnlinkVariableTemplate(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	dsId, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	if dsId == 0 || teamId == 0 {
		c.JSON(400, common.RespError("invalid variable id"))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	err := acl.CanEditTeam(c.Request.Context(), teamId, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE variable SET template_id=0 WHERE team_id=? and id=?", teamId, dsId)
	if err != nil {
		logger.Warn("unlink variable template error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}
}
