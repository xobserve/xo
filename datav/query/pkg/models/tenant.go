package models

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/pkg/db"
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

type TenantUser struct {
	Id             int64     `json:"id"`
	TenantId       int64     `json:"tenantId,omitempty"`
	Username       string    `json:"username"`
	Created        time.Time `json:"created"`
	Role           RoleType  `json:"role"`
	RoleSortWeight int       `json:"-"`
}

type TenantUsers []*TenantUser

func (s TenantUsers) Len() int      { return len(s) }
func (s TenantUsers) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s TenantUsers) Less(i, j int) bool {
	return s[i].RoleSortWeight > s[j].RoleSortWeight
}

func QueryTenantUser(ctx context.Context, tenantId int64, userId int64) (*TenantUser, error) {
	member := &TenantUser{}
	member.Role = ROLE_VIEWER
	err := db.Conn.QueryRowContext(ctx, `SELECT role FROM tenant_user WHERE tenant_id=? and user_id=?`,
		tenantId, userId).Scan(&member.Role)
	if err != nil {
		return nil, err
	}

	member.Id = userId
	member.TenantId = tenantId

	return member, nil
}
