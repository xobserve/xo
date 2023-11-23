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
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "tenant")

func QueryTenants(c *gin.Context) {
	u := c.MustGet("currentUser").(*models.User)

	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
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
	u := c.MustGet("currentUser").(*models.User)

	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	req := &models.Tenant{}
	c.Bind(&req)

	if req.Name == "" {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
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
		id, u.Id, models.ROLE_SUPER_ADMIN, now, now)
	if err != nil {
		logger.Warn("Error create tenant user", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	// create default team
	_, err = models.CreateTeam(c.Request.Context(), tx, id, u.Id, models.DefaultTeamName, "default team")
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
	_, err := models.QueryTenantUser(c.Request.Context(), tenantId, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("you not in tenant"))
			return
		}
		logger.Warn("query user in tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
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

func SubmitTenantUser(c *gin.Context) {
	u := c.MustGet("currentUser").(*models.User)

	req := &models.User{}
	c.Bind(&req)

	if req.Username == "" || !req.Role.IsValid() {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	targetUser, err := models.QueryUserByName(c.Request.Context(), req.Username)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError(e.UserNotExist))
			return
		}
		logger.Warn("query target user error when submit user", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if targetUser.Id == u.Id {
		c.JSON(400, common.RespError("you cant submit yourself"))
		return
	}

	if req.Role == models.ROLE_SUPER_ADMIN {
		c.JSON(400, common.RespError("can not submit super admin"))
		return
	}

	tenantRole, err := models.QueryTenantRoleByUserId(c.Request.Context(), req.CurrentTenant, u.Id)
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
		// only super admin can delete admin in tenant
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

	now := time.Now()
	if req.Id == 0 {
		// insert
		tx, err := db.Conn.Begin()
		if err != nil {
			logger.Warn("new user error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
		defer tx.Rollback()

		err = AddUserToTenant(targetUser.Id, req.CurrentTenant, req.Role, tx, c.Request.Context())
		if err != nil {
			if e.IsErrUniqueConstraint(err) {
				c.JSON(400, common.RespError("user already in tenant"))
				return
			}
			logger.Warn("insert tenant user error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		err = tx.Commit()
		if err != nil {
			logger.Warn("commit sql transaction error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
	} else {
		// update
		_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE tenant_user SET role=?,updated=? WHERE tenant_id=? AND user_id=?",
			req.Role, now, req.CurrentTenant, targetUser.Id)
		if err != nil {
			logger.Warn("update tenant user error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
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

	u := c.MustGet("currentUser").(*models.User)

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

func AddUserToTenant(userId int64, tenantId int64, role models.RoleType, tx *sql.Tx, ctx context.Context) error {
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
			tenantId, teamId, userId, role, now, now)
		if err != nil {
			return err
		}
	}

	return nil
}

func GetTenantsUserIn(c *gin.Context) {
	tenants := make([]*models.Tenant, 0)
	var err error

	u := c.MustGet("currentUser").(*models.User)
	tenants, err = models.QueryTenantsByUserId(c.Request.Context(), u.Id)
	if err != nil {
		logger.Warn("query tenants by user id error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(tenants))
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

	u := c.MustGet("currentUser").(*models.User)
	tenantUser, err := models.QueryTenantUser(c.Request.Context(), req.Id, u.Id)
	if err != nil {
		logger.Warn("query user in tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if !tenantUser.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NeedTenantAdmin))
		return
	}

	now := time.Now()

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE tenant SET name=?,is_public=?, updated=? WHERE id=?", req.Name, req.IsPublic, now, req.Id)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError(fmt.Sprintf("tenant `%s` already exist", req.Name)))
			return
		}
		logger.Warn("update tenant error", "error", err)
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

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE tenant SET status=?,statusUpdated=? WHERE id=?", common.StatusDeleted, time.Now(), tenantId)
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

	u := c.MustGet("currentUser").(*models.User)

	if !u.Role.IsSuperAdmin() {
		c.JSON(403, common.RespError("Only tenant super admin can do this"))
		return
	}

	_, err := db.Conn.ExecContext(c.Request.Context(), "UPDATE tenant SET status=?,statusUpdated=? WHERE id=?", common.StatusOK, time.Now(), tenantId)
	if err != nil {
		logger.Warn("restore tenant error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
}

func DeleteTenant(tenantId int64) error {
	return nil
}
