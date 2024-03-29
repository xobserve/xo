package tenant

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xobserve/xo/query/internal/accesstoken"
	"github.com/xobserve/xo/query/internal/acl"
	"github.com/xobserve/xo/query/pkg/colorlog"
	"github.com/xobserve/xo/query/pkg/common"
	"github.com/xobserve/xo/query/pkg/db"
	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "tenant")

func QueryTenants(c *gin.Context) {
	u := c.MustGet("currentUser").(*models.User)

	if err := acl.CanViewWebsite(u); err != nil {
		c.JSON(http.StatusForbidden, common.RespError(err.Error()))
		return
	}

	rows, err := db.Conn.QueryContext(c.Request.Context(), `SELECT id,name,status,created FROM tenant`)
	if err != nil {
		logger.Warn("Error get all tenants", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	tenants := make(models.Tenants, 0)
	defer rows.Close()

	for rows.Next() {
		tenant := &models.Tenant{}
		err := rows.Scan(&tenant.Id, &tenant.Name, &tenant.Status, &tenant.Created)
		if err != nil {
			logger.Warn("get all users scan error", "error", err)
			continue
		}

		owner, _ := models.QueryTenantOwner(c.Request.Context(), tenant.Id)
		tenant.Owner = owner.Username
		tenant.OwnerId = owner.Id
		tenants = append(tenants, tenant)
	}

	sort.Sort(tenants)
	c.JSON(200, common.RespSuccess(tenants))
}

func CreateTenant(c *gin.Context) {
	req := &models.Tenant{}
	c.Bind(&req)

	if req.Name == "" {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	ak := c.GetString("accessToken")

	if ak != "" {
		canManage, err := accesstoken.CanManageWebsite(ak)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		if !canManage {
			c.JSON(403, common.RespError(e.InvalidToken))
			return
		}
		if req.OwnerId == 0 {
			req.OwnerId = models.SuperAdminId
		}
	} else {
		u := c.MustGet("currentUser").(*models.User)

		if err := acl.CanEditWebsite(u); err != nil {
			c.JSON(http.StatusForbidden, common.RespError(err.Error()))
			return
		}
		req.OwnerId = u.Id
	}

	now := time.Now()

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("new user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	res, err := tx.ExecContext(c.Request.Context(), `INSERT INTO tenant (name,created,updated) VALUES (?,?,?)`, req.Name, now, now)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError("tenant already exist"))
			return
		}
		logger.Warn("Error create tenant", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	id, _ := res.LastInsertId()

	_, err = tx.ExecContext(c.Request.Context(), ("INSERT INTO tenant_user (tenant_id,user_id,role,created,updated) VALUES (?,?,?,?,?)"),
		id, req.OwnerId, models.ROLE_SUPER_ADMIN, now, now)
	if err != nil {
		logger.Warn("Error create tenant user", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	// create default team
	_, err = models.CreateTeam(c.Request.Context(), tx, id, req.OwnerId, models.DefaultTeamName, "default team")
	if err != nil {
		logger.Warn("Error create default team", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit sql transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

}

func QueryTenantUsers(c *gin.Context) {
	u := c.MustGet("currentUser").(*models.User)

	tenantId, _ := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if err := acl.CanViewTenant(c.Request.Context(), tenantId, u.Id); err != nil {
		c.JSON(http.StatusForbidden, common.RespError(err.Error()))
		return
	}

	rows, err := db.Conn.Query("SELECT user_id, role, created FROM tenant_user WHERE tenant_id=?", tenantId)
	if err != nil {
		logger.Warn("Error get all tenant users", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer rows.Close()

	tenantUsers := make(models.TenantUsers, 0)
	for rows.Next() {
		tenantUser := &models.TenantUser{}
		err := rows.Scan(&tenantUser.Id, &tenantUser.Role, &tenantUser.Created)
		if err != nil {
			logger.Warn("get all tenant users scan error", "error", err)
			continue
		}

		user, _ := models.QueryUserById(c.Request.Context(), tenantUser.Id)
		if user != nil {
			tenantUser.Username = user.Username
		}
		tenantUser.RoleSortWeight = models.RoleSortWeight(tenantUser.Role)

		tenantUsers = append(tenantUsers, tenantUser)
	}

	sort.Sort(tenantUsers)

	c.JSON(200, common.RespSuccess(tenantUsers))
}

type SubmitTenantUserReq struct {
	Usernames []string        `json:"usernames"`
	Role      models.RoleType `json:"role"`
	TenantId  int64           `json:"tenantId"`
}

func SubmitTenantUser(c *gin.Context) {
	req := &SubmitTenantUserReq{}
	c.Bind(&req)

	if req.Usernames == nil || !req.Role.IsValid() {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	if req.Role == models.ROLE_SUPER_ADMIN {
		c.JSON(400, common.RespError("can not submit super admin"))
		return
	}

	ak := c.GetString("accessToken")

	if ak != "" {
		canManage, err := accesstoken.CanManageTenant(req.TenantId, ak)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		if !canManage {
			c.JSON(403, common.RespError(e.InvalidToken))
			return
		}
	} else {
		u := c.MustGet("currentUser").(*models.User)

		tenantRole, err := models.QueryTenantRoleByUserId(c.Request.Context(), req.TenantId, u.Id)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(400, common.RespError("user not in tenant"))
				return
			}
			logger.Warn("query target user error when add user to tenant", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		if req.Role.IsAdmin() {
			if !tenantRole.IsSuperAdmin() {
				c.JSON(403, common.RespError("Only super admin can submit admin member"))
				return
			}
		} else {
			if !tenantRole.IsAdmin() {
				c.JSON(403, common.RespError(e.NoPermission))
				return
			}
		}
	}

	// insert
	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("new user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()
	for _, username := range req.Usernames {
		targetUser, err := models.QueryUserByName(c.Request.Context(), username)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(400, common.RespError(e.UserNotExist))
				return
			}
			logger.Warn("query target user error when submit user", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		err = models.AddUserToTenant(targetUser.Id, req.TenantId, req.Role, tx, c.Request.Context())
		if err != nil {
			if e.IsErrUniqueConstraint(err) {
				c.JSON(400, common.RespError("user already in tenant"))
				return
			}
			logger.Warn("insert tenant user error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit sql transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

}

type ChangeTenantUserReq struct {
	UserId   int64           `json:"userId"`
	TenantId int64           `json:"tenantId"`
	Role     models.RoleType `json:"role"`
}

func ChangeTenantUserRole(c *gin.Context) {
	req := &ChangeTenantUserReq{}
	c.Bind(&req)

	if !req.Role.IsValid() {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	if req.Role == models.ROLE_SUPER_ADMIN {
		c.JSON(400, common.RespError("can not set user to  super admin"))
		return
	}

	targetUser, err := models.QueryUserById(c.Request.Context(), req.UserId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError(e.UserNotExist))
			return
		}
		logger.Warn("query target user error when submit user", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	if targetUser.Role == models.ROLE_SUPER_ADMIN {
		c.JSON(400, common.RespError("can not change the role of  super admin"))
		return
	}

	ak := c.GetString("accessToken")
	if ak != "" {
		canManage, err := accesstoken.CanManageTenant(req.TenantId, ak)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		if !canManage {
			c.JSON(403, common.RespError(e.InvalidToken))
			return
		}
	} else {
		u := c.MustGet("currentUser").(*models.User)

		tenantRole, err := models.QueryTenantRoleByUserId(c.Request.Context(), req.TenantId, u.Id)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(400, common.RespError("user not in tenant"))
				return
			}
			logger.Warn("query target user error when add user to tenant", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		if req.Role.IsAdmin() {
			if !tenantRole.IsSuperAdmin() {
				c.JSON(403, common.RespError("Only super admin can submit admin member"))
				return
			}
		} else {
			if !tenantRole.IsAdmin() {
				c.JSON(403, common.RespError(e.NoPermission))
				return
			}
		}
	}

	// 	// update
	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE tenant_user SET role=?,updated=? WHERE tenant_id=? AND user_id=?",
		req.Role, time.Now(), req.TenantId, req.UserId)
	if err != nil {
		logger.Warn("update tenant user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
}

func DeleteTenantUser(c *gin.Context) {
	targetUserId, _ := strconv.ParseInt(c.Param("userId"), 10, 64)
	if targetUserId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	tenantId, _ := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if tenantId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	tenantUser, err := models.QueryTenantUser(c.Request.Context(), tenantId, targetUserId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("user not in tenant"))
			return
		}
		logger.Warn("query target user error when delete user", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if tenantUser.Role.IsSuperAdmin() {
		c.JSON(400, common.RespError("can not delete super admin in tenant"))
		return
	}

	ak := c.GetString("accessToken")

	if ak != "" {
		canManage, err := accesstoken.CanManageTenant(tenantId, ak)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		if !canManage {
			c.JSON(403, common.RespError(e.InvalidToken))
			return
		}
	} else {
		u := c.MustGet("currentUser").(*models.User)
		tenantRole, err := models.QueryTenantRoleByUserId(c.Request.Context(), tenantId, u.Id)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(400, common.RespError("you are not in this tenant"))
				return
			}
			logger.Warn("query tenant role by user id error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		if tenantUser.Role.IsAdmin() {
			// only super admin can delete admin in tenant
			if !tenantRole.IsSuperAdmin() {
				c.JSON(403, common.RespError(e.NoPermission))
				return
			}
		} else {
			if !tenantRole.IsAdmin() {
				c.JSON(403, common.RespError(e.NoPermission))
				return
			}
		}
	}

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("leave tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(c.Request.Context(), "DELETE FROM tenant_user where tenant_id=? and user_id=?", tenantId, targetUserId)
	if err != nil {
		logger.Warn("leave tenant  error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	_, err = tx.ExecContext(c.Request.Context(), "DELETE FROM team_member where tenant_id=? and user_id=?", tenantId, targetUserId)
	if err != nil {
		logger.Warn("leave team  error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit sql transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
}

type TenantTeam struct {
	TenantId   int64          `json:"tenantId"`
	TenantName string         `json:"tenantName"`
	Teams      []*models.Team `json:"teams"`
}

func GetTenantsUserIn(c *gin.Context) {
	tenantTeams := make([]*TenantTeam, 0)

	u := c.MustGet("currentUser").(*models.User)
	tenants, err := models.QueryTenantsByUserId(c.Request.Context(), u.Id)
	if err != nil {
		logger.Warn("query tenants by user id error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	for _, tenant := range tenants {
		tenantTeam := &TenantTeam{
			TenantId:   tenant.Id,
			TenantName: tenant.Name,
			Teams:      make([]*models.Team, 0),
		}

		teams0, err := models.QueryTeamsUserInTenant(c.Request.Context(), tenant.Id, u.Id)
		if err != nil {
			logger.Warn("query teams for user error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		for _, t := range teams0 {
			team, err := models.QueryTeam(c.Request.Context(), t.Id, "")
			if err != nil {
				logger.Warn("query team error", "error", err)
				continue
			}

			if team.Status == common.StatusOK {
				tenantTeam.Teams = append(tenantTeam.Teams, team)
			}
		}

		tenantTeams = append(tenantTeams, tenantTeam)
	}

	c.JSON(200, common.RespSuccess(tenantTeams))
}

func SwitchTenant(c *gin.Context) {
	u := c.MustGet("currentUser").(*models.User)
	tenantId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if tenantId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	teamId, err := SetTenantForUser(c.Request.Context(), tenantId, u.Id)
	if err != nil {
		logger.Warn("switch tenant error", "error", err)
		c.JSON(500, common.RespError(err.Error()))
		return
	}

	c.JSON(200, common.RespSuccess(teamId))
}

func SetTenantForUser(ctx context.Context, tenantId int64, userId int64) (int64, error) {
	var teamId int64
	teams, err := models.QueryVisibleTeamsByUserId(ctx, tenantId, userId)
	if err != nil {
		return 0, err
	}

	if len(teams) == 0 {
		return 0, errors.New("you are not in any team of this tenant")
	}

	teamId = teams[0]
	_, err = db.Conn.ExecContext(ctx, "UPDATE user SET current_tenant=?, current_team=? WHERE id=?", tenantId, teamId, userId)
	if err != nil {
		return 0, err
	}

	return teams[0], nil
}

func GetTenant(c *gin.Context) {
	tenantId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if tenantId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	tenant, err := models.QueryTenant(c.Request.Context(), tenantId)
	if err != nil {
		logger.Warn("query tenant by id error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(tenant))
}

func UpdateTenant(c *gin.Context) {
	req := &models.Tenant{}
	c.Bind(&req)

	if req.Name == "" {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	oldTenant, err := models.QueryTenant(c.Request.Context(), req.Id)
	if err != nil {
		c.JSON(400, common.RespError("get tenant error:"+err.Error()))
		return
	}

	ak := c.GetString("accessToken")

	if ak != "" {
		canManage, err := accesstoken.CanManageTenant(req.Id, ak)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		if !canManage {
			c.JSON(403, common.RespError(e.InvalidToken))
			return
		}
	} else {
		u := c.MustGet("currentUser").(*models.User)
		if err := acl.CanEditTenant(c.Request.Context(), req.Id, u.Id); err != nil {
			c.JSON(http.StatusForbidden, common.RespError(err.Error()))
			return
		}
	}

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("leave tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	now := time.Now()
	_, err = tx.ExecContext(c.Request.Context(), "UPDATE tenant SET name=?, updated=?, sync_users=? WHERE id=?", req.Name, now, req.SyncUsers, req.Id)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError(fmt.Sprintf("tenant `%s` already exist", req.Name)))
			return
		}
		logger.Warn("update tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if !oldTenant.SyncUsers && req.SyncUsers {
		userIds, err := models.GetAllUserIds()
		if err != nil {
			c.JSON(400, common.RespError("get user ids error:"+err.Error()))
			return
		}

		for _, userId := range userIds {
			err = models.AddUserToTenant(userId, oldTenant.Id, models.ROLE_VIEWER, tx, c.Request.Context())
			if err != nil && !e.IsErrUniqueConstraint(err) {
				logger.Warn("add team member error", "error", err)
				c.JSON(400, common.RespError(err.Error()))
				return
			}
		}

	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit sql transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func TransferTenant(c *gin.Context) {
	tenantId, _ := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	if tenantId == 0 {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	if tenantId == models.DefaultTenantId {
		c.JSON(400, common.RespError("can not transfer default tenant to other user"))
		return
	}

	transferTo := c.Param("username")

	u := c.MustGet("currentUser").(*models.User)

	operator, err := models.QueryTenantUser(c.Request.Context(), tenantId, u.Id)
	if err != nil {
		logger.Warn("update tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	// only superadmin can transfer tenant
	if !operator.Role.IsSuperAdmin() {
		c.JSON(403, common.RespError("Only tenant super admin can do this"))
		return
	}

	// get transfer to user
	transferToUser, err := models.QueryUserByName(c.Request.Context(), transferTo)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("user not exist"))
			return
		}
		logger.Warn("query user by name error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	// can't transfer to self
	if transferToUser.Id == u.Id {
		c.JSON(400, common.RespError("can't transfer to yourself"))
		return
	}

	// must transfer to a tenant user
	_, err = models.QueryTenantUser(c.Request.Context(), tenantId, transferToUser.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("the user which you want to transfer to is not in tenant"))
			return
		}
		logger.Warn("query tenant user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	// transfer
	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("transfer tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	now := time.Now()
	// set target user to super admin
	_, err = tx.ExecContext(c.Request.Context(), "UPDATE tenant_user SET role=?,updated=? WHERE tenant_id=? AND user_id=?", models.ROLE_SUPER_ADMIN, now, tenantId, transferToUser.Id)
	if err != nil {
		logger.Warn("transfer tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	//set self to admin
	_, err = tx.ExecContext(c.Request.Context(), "UPDATE tenant_user SET role=?,updated=? WHERE tenant_id=? AND user_id=?", models.ROLE_ADMIN, now, tenantId, u.Id)
	if err != nil {
		logger.Warn("transfer tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit sql transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
}

func LeaveTenant(c *gin.Context) {
	tenantId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if tenantId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	if tenantId == models.DefaultTenantId && u.Id == models.SuperAdminId {
		c.JSON(400, common.RespError("admin user cant leave default tenant"))
		return
	}

	tenantUser, err := models.QueryTenantUser(c.Request.Context(), tenantId, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("you not in tenant"))
			return
		}
		logger.Warn("query tenant user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if tenantUser.Role.IsSuperAdmin() {
		c.JSON(400, common.RespError("team super admin can't leave team, please transfer team to other member first"))
		return
	}

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("leave tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(c.Request.Context(), "DELETE FROM tenant_user where tenant_id=? and user_id=?", tenantId, u.Id)
	if err != nil {
		logger.Warn("leave tenant  error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	_, err = tx.ExecContext(c.Request.Context(), "DELETE FROM team_member where tenant_id=? and user_id=?", tenantId, u.Id)
	if err != nil {
		logger.Warn("leave team  error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit sql transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
}

func MarkDeleted(c *gin.Context) {
	tenantId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if tenantId == 0 {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	if tenantId == models.DefaultTenantId {
		c.JSON(400, common.RespError("can not delete default tenant"))
		return
	}

	ak := c.GetString("accessToken")
	if ak != "" {
		canManage, err := accesstoken.CanManageWebsite(ak)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		if !canManage {
			c.JSON(403, common.RespError(e.InvalidToken))
			return
		}
	} else {
		u := c.MustGet("currentUser").(*models.User)
		operator, err := models.QueryTenantUser(c.Request.Context(), tenantId, u.Id)
		if err != nil {
			logger.Warn("update tenant error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		// only superadmin can delete tenant
		if !operator.Role.IsSuperAdmin() {
			c.JSON(403, common.RespError("Only tenant super admin can do this"))
			return
		}
	}

	_, err := db.Conn.ExecContext(c.Request.Context(), "UPDATE tenant SET status=?,statusUpdated=? WHERE id=?", common.StatusDeleted, time.Now(), tenantId)
	if err != nil {
		logger.Warn("update tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
}

func RestoreTenant(c *gin.Context) {
	tenantId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if tenantId == 0 {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	ak := c.GetString("accessToken")
	if ak != "" {
		canManage, err := accesstoken.CanManageWebsite(ak)
		if err != nil {
			c.JSON(400, common.RespError(err.Error()))
			return
		}
		if !canManage {
			c.JSON(403, common.RespError(e.InvalidToken))
			return
		}
	} else {
		u := c.MustGet("currentUser").(*models.User)

		if !u.Role.IsSuperAdmin() {
			c.JSON(403, common.RespError("Only tenant super admin can do this"))
			return
		}
	}

	_, err := db.Conn.ExecContext(c.Request.Context(), "UPDATE tenant SET status=?,statusUpdated=? WHERE id=?", common.StatusOK, time.Now(), tenantId)
	if err != nil {
		logger.Warn("restore tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
}

func DeleteTenant(tenantId int64) error {
	if tenantId == models.DefaultTenantId {
		return fmt.Errorf("can not delete default tenant")
	}

	tx, err := db.Conn.Begin()
	if err != nil {
		return fmt.Errorf("start sql tx in delete tenant error: %w", err)
	}
	defer tx.Rollback()

	// delete tenant teams
	teamIds, err := models.QueryTenantAllTeamIds(tenantId)
	if err != nil {
		return fmt.Errorf("query tenant all team ids error: %w", err)
	}

	for _, teamId := range teamIds {
		err = models.DeleteTeam(context.Background(), teamId, tx)
		if err != nil {
			logger.Error("task: delete team", "error", err)
		}
	}

	// delete tenant users
	_, err = tx.Exec("DELETE FROM tenant_user WHERE tenant_id=?", tenantId)
	if err != nil {
		return fmt.Errorf("delete tenant user error: %w", err)
	}

	// delete tenant
	_, err = tx.Exec("DELETE FROM tenant WHERE id=?", tenantId)
	if err != nil {
		return fmt.Errorf("delete tenant error: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("commit sql tx in delete tenant error: %w", err)
	}

	return nil
}
