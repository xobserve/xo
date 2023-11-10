package models

import (
	"time"

	"github.com/gin-gonic/gin"
)

const DefaultTenant = "default"
const DefaultTenantId = 1

type Tenant struct {
	Id      int64     `json:"id"`
	Name    string    `json:"name"`
	OwnerId int64     `json:"ownerId"`
	Owner   string    `json:"owner"`
	Created time.Time `json:"created"`
}

type Tenants []*Tenant

func (s Tenants) Len() int      { return len(s) }
func (s Tenants) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s Tenants) Less(i, j int) bool {
	return s[i].Created.Unix() > s[j].Created.Unix()
}

func GetTenant(c *gin.Context) string {
	return DefaultTenant
}
