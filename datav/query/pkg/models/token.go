package models

import "time"

type ApiToken struct {
	Token       string    `json:"token"`
	Scope       int       `json:"scope"`
	ScopeId     int64     `json:"scopeId"`
	Description string    `json:"description"`
	CreatedBy   int64     `json:"createdBy"`
	Created     time.Time `json:"created"`
	Expired     time.Time `json:"expired"`
}
