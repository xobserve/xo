package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	b64 "encoding/base64"
	"encoding/json"

	"github.com/xObserve/xObserve/query/pkg/db"
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
	Scope       int       `json:"scope"`             // 1. Website 2. Tenant 3. Team
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
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("the template content which you are visiting is not exist")
		}
		return nil, err
	}

	return content, nil
}
