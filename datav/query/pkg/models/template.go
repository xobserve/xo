package models

import (
	"context"
	"encoding/json"
	"time"

	"github.com/xObserve/xObserve/query/pkg/db"
)

const (
	TemplateTypeApp       = 1
	TemplateTypeDashboard = 2
	TemplateTypePanel     = 3
)

const NativeTemplateProvider = "xobserve"
const CustomTemplateProvider = "user-custom"

type Template struct {
	Id          int64       `json:"id"`
	Type        int         `json:"type"` // 1. App  2. Dashboard  3. Panel
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Scope       int         `json:"scope"`   // 1. Website 2. Tenant 3. Team
	OwnedBy     int64       `json:"ownedBy"` // based on scope, e.g when scope == 2, ownedBy is tenantId
	Content     interface{} `json:"content"` // json encoded string
	Version     string      `json:"version"`
	Provider    string      `json:"provider"` // e.g xobserve , user-custom , third-party
	Created     time.Time   `json:"created"`
	Updated     time.Time   `json:"updated"`
}

func QueryTemplateById(ctx context.Context, id int64) (*Template, error) {
	t := &Template{}
	var rawdata []byte
	err := db.Conn.QueryRowContext(ctx, "SELECT id,type,title,description,scope,owned_by,content,version,provider,created,updated FROM template WHERE id=?", id).Scan(
		&t.Id, &t.Type, &t.Title, &t.Description, &t.Scope, &t.OwnedBy, &rawdata, &t.Version, &t.Provider, &t.Created, &t.Updated,
	)
	if err != nil {
		return nil, err
	}

	if rawdata != nil {
		err = json.Unmarshal(rawdata, &t.Content)
	}

	return t, err
}
