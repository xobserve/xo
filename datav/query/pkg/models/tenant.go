package models

import (
	"context"
	"database/sql"
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

func QueryTenant(ctx context.Context, tenantId int64) (*Tenant, error) {
	tenant := &Tenant{
		Id: tenantId,
	}
	err := db.Conn.QueryRowContext(ctx, `SELECT  name,owner_id,created FROM tenant WHERE id=?`, tenantId).Scan(&tenant.Name, &tenant.OwnerId, &tenant.Created)
	if err != nil {
		return nil, err
	}

	return tenant, nil
}

func QueryTenantsByUserId(userId int64) ([]*Tenant, error) {
	tenants := make([]*Tenant, 0)
	rows, err := db.Conn.Query("SELECT tenant_user.tenant_id,tenant.name FROM tenant_user INNER JOIN tenant ON tenant_user.tenant_id = tenant.id  WHERE user_id=? ORDER BY tenant_user.tenant_id", userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return tenants, nil
		}
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		tenant := &Tenant{}
		err := rows.Scan(&tenant.Id, &tenant.Name)
		if err != nil {
			return nil, err
		}

		tenants = append(tenants, tenant)
	}

	return tenants, nil
}

func QueryPublicTenants() ([]int64, error) {
	tenants := make([]int64, 0)
	rows, err := db.Conn.Query("SELECT id FROM tenant WHERE is_public=? ORDER BY id", true)
	if err != nil {
		if err == sql.ErrNoRows {
			return tenants, nil
		}
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var tenantId int64
		err := rows.Scan(&tenantId)
		if err != nil {
			return nil, err
		}

		tenants = append(tenants, tenantId)
	}

	return tenants, nil
}

func QueryTenantTeamIds(tenantId int64) ([]int64, error) {
	teamIds := make([]int64, 0)
	rows, err := db.Conn.Query("SELECT id FROM team WHERE tenant_id=?", tenantId)
	if err != nil {
		if err == sql.ErrNoRows {
			return teamIds, nil
		}
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var teamId int64
		err := rows.Scan(&teamId)
		if err != nil {
			return nil, err
		}

		teamIds = append(teamIds, teamId)
	}

	return teamIds, nil
}

func QueryTenantPublicTeamIds(tenantId int64) ([]int64, error) {
	teamIds := make([]int64, 0)
	rows, err := db.Conn.Query("SELECT id FROM team WHERE tenant_id=? and is_public=true", tenantId)
	if err != nil {
		if err == sql.ErrNoRows {
			return teamIds, nil
		}
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var teamId int64
		err := rows.Scan(&teamId)
		if err != nil {
			return nil, err
		}

		teamIds = append(teamIds, teamId)
	}

	return teamIds, nil
}

func IsUserInTenant(userId, tenantId int64) (bool, error) {
	var id int64
	err := db.Conn.QueryRow(`SELECT id FROM tenant_user WHERE tenant_id=? and user_id=?`, tenantId, userId).Scan(&id)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}

	if id == 0 {
		return false, nil
	}

	return true, nil
}
