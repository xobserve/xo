package models

import (
	"context"
	"database/sql"
	"time"

	"github.com/xobserve/xo/query/pkg/common"
	"github.com/xobserve/xo/query/pkg/db"
)

const DefaultTenant = "default"
const DefaultTenantId = 1

type Tenant struct {
	Id          int64     `json:"id"`
	Name        string    `json:"name"`
	OwnerId     int64     `json:"ownerId"`
	Owner       string    `json:"owner"`
	NumTeams    int       `json:"numTeams"`
	Teams       []*Team   `json:"teams,omitempty"`
	SyncUsers   bool      `json:"syncUsers"`
	Created     time.Time `json:"created"`
	Status      int       `json:"status"`
	CurrentRole RoleType  `json:"-"`
}

type Tenants []*Tenant

func (s Tenants) Len() int      { return len(s) }
func (s Tenants) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s Tenants) Less(i, j int) bool {
	return s[i].Created.Unix() > s[j].Created.Unix()
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

	err := db.Conn.QueryRowContext(ctx, `SELECT  name,sync_users,created FROM tenant WHERE id=? and status!=?`, tenantId, common.StatusDeleted).Scan(&tenant.Name, &tenant.SyncUsers, &tenant.Created)
	if err != nil {
		return nil, err
	}

	return tenant, nil
}

func QueryTenantIdByTeamId(ctx context.Context, teamId int64) (int64, error) {
	var tenantId int64
	err := db.Conn.QueryRowContext(ctx, `SELECT  tenant_id FROM team WHERE id=?`, teamId).Scan(&tenantId)
	if err != nil {
		return 0, err
	}

	return tenantId, nil
}

func QueryTenantsByUserId(ctx context.Context, userId int64) ([]*Tenant, error) {
	tenants, err := QueryTenantsUserIn(ctx, userId)
	if err != nil {
		return nil, err
	}

	for _, tenant := range tenants {
		db.Conn.QueryRow("SELECT count(*) FROM team_member WHERE user_id=? and tenant_id=?", userId, tenant.Id).Scan(&tenant.NumTeams)
	}

	return tenants, nil
}

func QueryTenantsUserIn(ctx context.Context, userId int64) ([]*Tenant, error) {
	tenants := make([]*Tenant, 0)
	rows, err := db.Conn.QueryContext(ctx, "SELECT tenant_user.tenant_id,tenant_user.role,tenant.name,tenant.status FROM tenant_user INNER JOIN tenant ON tenant_user.tenant_id = tenant.id  WHERE user_id=? ORDER BY tenant_user.tenant_id", userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return tenants, nil
		}
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		tenant := &Tenant{}
		err := rows.Scan(&tenant.Id, &tenant.CurrentRole, &tenant.Name, &tenant.Status)
		if err != nil {
			return nil, err
		}

		if tenant.Status == common.StatusDeleted {
			continue
		}
		tenants = append(tenants, tenant)
	}

	return tenants, nil
}

func QueryTenantTeamIds(tenantId int64) ([]int64, error) {
	teamIds := make([]int64, 0)
	rows, err := db.Conn.Query("SELECT id FROM team WHERE tenant_id=? and status!=?", tenantId, common.StatusDeleted)
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

func QueryTenantAllTeamIds(tenantId int64) ([]int64, error) {
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

func QueryPublicTenant() int64 {
	return DefaultTenantId
}

func QueryTenantRoleByUserId(ctx context.Context, tenantId, userId int64) (RoleType, error) {
	var role RoleType
	err := db.Conn.QueryRowContext(ctx, `SELECT role FROM tenant_user WHERE tenant_id=? and user_id=?`, tenantId, userId).Scan(&role)
	if err != nil {
		return ROLE_VIEWER, err
	}

	return role, nil
}

func QueryTenantOwner(ctx context.Context, tenantId int64) (*User, error) {
	user := &User{}
	err := db.Conn.QueryRowContext(ctx, `SELECT tenant_user.user_id,user.username FROM tenant_user INNER JOIN user ON user.id=tenant_user.user_id WHERE tenant_user.tenant_id=? and tenant_user.role=?`, tenantId, ROLE_SUPER_ADMIN).Scan(&user.Id, &user.Username)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func IsTenantExist(ctx context.Context, id int64) bool {
	var qid int64
	err := db.Conn.QueryRowContext(ctx, `SELECT id FROM tenant WHERE id=? and status !=?`, id, common.StatusDeleted).Scan(&qid)
	if err != nil {
		return false
	}

	if qid == id {
		return true
	}

	return false
}

func QueryAllTenantIds(ctx context.Context) ([]int64, error) {
	tenantIds := make([]int64, 0)
	rows, err := db.Conn.Query("SELECT id FROM tenant")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var tenantId int64
		err := rows.Scan(&tenantId)
		if err != nil {
			return nil, err
		}

		tenantIds = append(tenantIds, tenantId)
	}

	return tenantIds, nil
}

func GetEnableSyncUsersTenants() ([]int64, error) {
	tenants := make([]int64, 0)
	rows, err := db.Conn.Query("SELECT id FROM tenant WHERE sync_users=?", true)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var id int64
		err = rows.Scan(&id)
		if err != nil {
			return nil, err
		}

		tenants = append(tenants, id)
	}

	return tenants, nil
}

func AddUserToTenant(userId int64, tenantId int64, role RoleType, tx *sql.Tx, ctx context.Context) error {
	now := time.Now()
	_, err := tx.ExecContext(ctx, ("INSERT INTO tenant_user (tenant_id,user_id,role,created,updated) VALUES (?,?,?,?,?)"),
		tenantId, userId, role, now, now)
	if err != nil {
		return err
	}

	// find teams in tenant that enables user sync
	rows, err := tx.QueryContext(ctx, `SELECT id FROM team WHERE tenant_id=? AND sync_users=true`, tenantId)
	if err != nil {
		return err
	}

	defer rows.Close()
	teamIds := make([]int64, 0)
	for rows.Next() {
		var teamId int64
		err := rows.Scan(&teamId)
		if err != nil {
			return err
		}
		teamIds = append(teamIds, teamId)
	}

	for _, teamId := range teamIds {
		_, err = tx.ExecContext(ctx, ("INSERT INTO team_member (tenant_id,team_id,user_id,role,created,updated) VALUES (?,?,?,?,?,?)"),
			tenantId, teamId, userId, ROLE_VIEWER, now, now)
		if err != nil {
			return err
		}
	}

	return nil
}
