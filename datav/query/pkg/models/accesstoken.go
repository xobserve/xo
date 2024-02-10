package models

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
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
	Mode        int       `json:"mode"` // 0: read only 1. manage
	CreatedBy   int64     `json:"createdBy"`
	Created     time.Time `json:"created"`
	Expired     int       `json:"expired"`
}

type AccessTokens []*AccessToken

func (s AccessTokens) Len() int      { return len(s) }
func (s AccessTokens) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s AccessTokens) Less(i, j int) bool {
	if s[i].Expired == 0 {
		return false
	}

	if s[j].Expired == 0 {
		return true
	}

	first := s[i].Created.Unix() + int64(s[i].Expired*24*3600)
	second := s[j].Created.Unix() + int64(s[j].Expired*24*3600)
	return first < second
}

func GetAccessToken(id int64, tk string) (*AccessToken, error) {
	token := &AccessToken{}
	err := db.Conn.QueryRow("SELECT id,name, token, scope, scope_id, description, mode, created, created_by, expired FROM access_token WHERE id = ? OR token = ?", id, tk).Scan(
		&token.Id, &token.Name, &token.Token, &token.Scope, &token.ScopeId, &token.Description, &token.Mode, &token.Created, &token.CreatedBy, &token.Expired,
	)

	return token, err
}

func GenerateAccessToken(length int, scope int, mode int) (string, error) {
	token := make([]byte, ((length-10)/2 - 1))
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%s%s%d%d", strconv.FormatInt(time.Now().Unix(), 10), hex.EncodeToString(token), scope, mode), nil
}
