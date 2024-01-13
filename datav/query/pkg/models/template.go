package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	b64 "encoding/base64"
	"encoding/json"

	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
)

const (
	TemplateTypeApp       = 1
	TemplateTypeDashboard = 2
	TemplateTypePanel     = 3
)

var TemplateTypeText = map[int]string{
	1: "App",
	2: "Dashboard",
	3: "Panel",
}

const (
	TemplateCreateClone = "1"
	TemplateCreateRefer = "2"
)

const NativeTemplateProvider = "xobserve"
const CustomTemplateProvider = "user-custom"

type Template struct {
	Id          int64     `json:"id"`
	Type        int       `json:"type"` // 1. App  2. Dashboard  3. Panel
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	Scope       int       `json:"scope"`             // Create in 1. Website 2. Tenant 3. Team scope
	OwnedBy     int64     `json:"ownedBy"`           // based on scope, e.g when scope == 2, ownedBy is tenantId
	ContentId   int64     `json:"contentId"`         // json encoded string
	Version     string    `json:"version,omitempty"` // content version
	Provider    string    `json:"provider"`          // e.g xobserve , user-custom , third-party
	Tags        []string  `json:"tags"`
	Created     time.Time `json:"created"`
}

type TemplateContent struct {
	Id          int64       `json:"id"`
	TemplateId  int64       `json:"templateId"`
	Content     interface{} `json:"content,omitempty"`
	Version     string      `json:"version"`
	Description string      `json:"description,omitempty"`
	Created     time.Time   `json:"created"`
}

type TemplateExport struct {
	Dashboards  []*Dashboard  `json:"dashboards"`
	Datasources []*Datasource `json:"datasources"`
	Variables   []*Variable   `json:"variables"`
}

func QueryTemplateById(ctx context.Context, id int64) (*Template, error) {
	t := &Template{}
	// var rawdata []byte
	var desc string
	var tags []byte
	err := db.Conn.QueryRowContext(ctx, "SELECT id,type,title,description,scope,owned_by,content_id,provider,tags,created FROM template WHERE id=?", id).Scan(
		&t.Id, &t.Type, &t.Title, &desc, &t.Scope, &t.OwnedBy, &t.ContentId, &t.Provider, &tags, &t.Created,
	)
	if err != nil {
		return nil, err
	}

	b, _ := b64.StdEncoding.DecodeString(desc)
	t.Description = string(b)

	if t.ContentId != 0 {
		v, err := QueryTemplateVersion(ctx, t.ContentId)
		if err != nil {
			return nil, err
		}
		t.Version = v
	}

	if tags != nil {
		err = json.Unmarshal(tags, &t.Tags)
		if err != nil {
			return nil, err
		}
	}

	return t, err
}

func QueryContentIdTemplateId(ctx context.Context, id int64) (int64, error) {
	var contentId int64
	err := db.Conn.QueryRow("SELECT content_id FROM template WHERE id=?", id).Scan(&contentId)
	if err != nil {
		return 0, err
	}

	if contentId == 0 {
		return 0, nil
	}

	return contentId, nil
}

func QueryTemplateExportByTemplateId(ctx context.Context, contentId int64) (*TemplateExport, error) {
	// get template content
	content, err := QueryTemplateContentBytes(ctx, contentId)
	if err != nil {
		return nil, err
	}

	var temp string
	err = json.Unmarshal(content, &temp)
	if err != nil {
		return nil, err
	}
	var templateExport *TemplateExport
	err = json.Unmarshal([]byte(temp), &templateExport)
	if err != nil {
		return nil, err
	}
	return templateExport, nil
}

func QueryTemplateVersion(ctx context.Context, id int64) (string, error) {
	var version string
	err := db.Conn.QueryRowContext(ctx, "SELECT version FROM template_content WHERE id=?", id).Scan(
		&version,
	)

	if err != nil {
		return "", err
	}

	return version, err
}

func QueryTemplateNewestVersion(ctx context.Context, id int64) (string, error) {
	var version string
	err := db.Conn.QueryRowContext(ctx, "SELECT version FROM template_content WHERE template_id=? ORDER BY created DESC limit 1", id).Scan(
		&version,
	)

	if err != nil {
		return "", err
	}

	return version, err
}

func QueryTemplateContent(ctx context.Context, id int64) (*TemplateContent, error) {
	content := &TemplateContent{}

	var rawdata []byte
	err := db.Conn.QueryRow("select id,template_id,description,version,content,created from template_content where id = ?", id).Scan(
		&content.Id, &content.TemplateId, &content.Description, &content.Version, &rawdata, &content.Created)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("the template content which you are visiting is not exist")
		}
		return nil, err
	}

	if rawdata != nil {
		err = json.Unmarshal(rawdata, &content.Content)
		if err != nil {
			return nil, err
		}
	}

	return content, nil
}

func QueryTemplateContentBytes(ctx context.Context, id int64) ([]byte, error) {
	var content []byte
	err := db.Conn.QueryRow("select content from template_content where id = ?", id).Scan(
		&content)
	if err != nil {
		return nil, err
	}

	return content, nil
}

func QueryTenantUseTemplates(tenantId int64) ([]int64, error) {
	rows, err := db.Conn.Query("SELECT template_id FROM template_use WHERE scope = ? and scope_id = ?", common.ScopeTenant, tenantId)
	if err != nil {
		return nil, err
	}

	ids := make([]int64, 0)
	for rows.Next() {
		var id int64
		err := rows.Scan(&id)
		if err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}

	return ids, nil
}

type TemplateUseByScope struct {
	Scope   int
	ScopeId int64
}

func QueryTemplateUsedByScopes(templateId int64) ([]*TemplateUseByScope, error) {
	rows, err := db.Conn.Query("SELECT scope,scope_id FROM template_use WHERE template_id = ?", templateId)
	if err != nil {
		return nil, err
	}

	scopes := make([]*TemplateUseByScope, 0)
	for rows.Next() {
		s := &TemplateUseByScope{}
		err := rows.Scan(&s.Scope, &s.ScopeId)
		if err != nil {
			return nil, err
		}
		scopes = append(scopes, s)
	}

	return scopes, nil
}

func QueryWebsiteUseTemplates() ([]int64, error) {
	rows, err := db.Conn.Query("SELECT template_id FROM template_use WHERE scope = ?", common.ScopeWebsite)
	if err != nil {
		return nil, err
	}

	ids := make([]int64, 0)
	for rows.Next() {
		var id int64
		err := rows.Scan(&id)
		if err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}

	return ids, nil
}

func CreateResourcesByTemplateExport(ctx context.Context, templateId int64, templateExport *TemplateExport, scopeType int, scopeId int64, userId int64, tx *sql.Tx) error {
	for _, dash := range templateExport.Dashboards {
		newDash := &Dashboard{
			Id:         dash.Id,
			TemplateId: templateId,
			Title:      dash.Title,
		}

		if newDash.Title == "" {
			newDash.Title = fmt.Sprintf("Refer from template %d ", templateId)
		}
		err := CreateDashboardInScope(ctx, scopeType, scopeId, userId, newDash, tx)
		if err != nil && !e.IsErrUniqueConstraint(err) {
			return err
		}
	}

	for _, ds := range templateExport.Datasources {
		ds.TemplateId = templateId
		err := CreateDatasourceInScope(ctx, scopeType, scopeId, ds, tx)
		if err != nil && !e.IsErrUniqueConstraint(err) {
			return err
		}
	}

	for _, v := range templateExport.Variables {
		v.TemplateId = templateId
		err := CreateVariableInScope(ctx, scopeType, scopeId, v, tx)
		if err != nil && !e.IsErrUniqueConstraint(err) {
			return err
		}
	}

	return nil
}

func RemoveTemplateResourcesInScope(ctx context.Context, tx *sql.Tx, scopeType int, scopeId int64, templateId int64, onlyDelDash bool) error {
	if scopeType == common.ScopeTeam {
		return removeTemplateResourcesInTeam(tx, scopeId, templateId, onlyDelDash)
	}

	if scopeType == common.ScopeTenant {
		return removeTemplateResourcesInTenant(tx, scopeId, templateId, onlyDelDash)
	}

	// scope website
	tenants, err := QueryAllTenantIds(ctx)
	if err != nil {
		return err
	}

	for _, tenantId := range tenants {
		err = removeTemplateResourcesInTenant(tx, tenantId, templateId, onlyDelDash)
		if err != nil {
			return err
		}
	}
	return nil
}

func removeTemplateResourcesInTenant(tx *sql.Tx, tenantId int64, templateId int64, onlyDelDash bool) error {
	teamIds, err := QueryTenantAllTeamIds(tenantId)
	if err != nil {
		return err
	}

	for _, teamId := range teamIds {
		err = removeTemplateResourcesInTeam(tx, teamId, templateId, onlyDelDash)
		if err != nil {
			return err
		}
	}

	return nil
}

func removeTemplateResourcesInTeam(tx *sql.Tx, teamId int64, templateId int64, onlyDelDash bool) error {
	// remove dashboards
	_, err := tx.Exec("DELETE FROM dashboard WHERE team_id=? and template_id=?", teamId, templateId)
	if err != nil {
		return fmt.Errorf("delete dashboard error: %w", err)
	}

	if !onlyDelDash {
		// remove datasources
		_, err = tx.Exec("DELETE FROM datasource WHERE team_id=? and template_id=?", teamId, templateId)
		if err != nil {
			return fmt.Errorf("delete datasource error: %w", err)
		}

		// remove variables
		_, err = tx.Exec("DELETE FROM variable WHERE team_id=? and template_id=?", teamId, templateId)
		if err != nil {
			return fmt.Errorf("delete variable error: %w", err)
		}

	}

	return nil
}
