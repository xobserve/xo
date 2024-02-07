package models

import (
	"time"

	"github.com/xObserve/xObserve/query/pkg/db"
)

type ApiToken struct {
	Id          int64     `json:"id"`
	Token       string    `json:"token"`
	Scope       int       `json:"scope"`
	ScopeId     int64     `json:"scopeId"`
	Description string    `json:"description"`
	CreatedBy   int64     `json:"createdBy"`
	Created     time.Time `json:"created"`
	Expired     int       `json:"expired"`
}

func GetApiToken(id int64, tk string) (*ApiToken, error) {
	token := &ApiToken{}
	err := db.Conn.QueryRow("SELECT id, token, scope, scope_id, description, created, created_by, expired FROM api_token WHERE id = ? OR token = ?", id, tk).Scan(
		&token.Id, &token.Token, &token.Scope, &token.ScopeId, &token.Description, &token.Created, &token.CreatedBy, &token.Expired,
	)

	return token, err
}
