package models

import (
	"crypto/rand"
	"encoding/hex"
	"strconv"
	"time"

	"github.com/xObserve/xObserve/query/pkg/db"
)

type AccessToken struct {
	Id          int64     `json:"id"`
	Name        string    `json:"name"`
	Token       string    `json:"token"`
	Scope       int       `json:"scope"`
	ScopeId     string    `json:"scopeId"`
	Description string    `json:"description"`
	CreatedBy   int64     `json:"createdBy"`
	Created     time.Time `json:"created"`
	Expired     int       `json:"expired"`
}

func GetAccessToken(id int64, tk string) (*AccessToken, error) {
	token := &AccessToken{}
	err := db.Conn.QueryRow("SELECT id,name, token, scope, scope_id, description, created, created_by, expired FROM access_token WHERE id = ? OR token = ?", id, tk).Scan(
		&token.Id, &token.Name, &token.Token, &token.Scope, &token.ScopeId, &token.Description, &token.Created, &token.CreatedBy, &token.Expired,
	)

	return token, err
}

func GenerateAccessToken(length int) (string, error) {
	token := make([]byte, (length-10)/2)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return strconv.FormatInt(time.Now().Unix(), 10) + hex.EncodeToString(token), nil
}
