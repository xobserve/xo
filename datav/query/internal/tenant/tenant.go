package tenant

import (
	"database/sql"
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/user"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "tenant")

func QueryTenants(c *gin.Context) {
	u := user.CurrentUser(c)

	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	rows, err := db.Conn.QueryContext(c.Request.Context(), `SELECT id,name,owner_id,created FROM tenant`)
	if err != nil {
		logger.Warn("Error get all tenants", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	tenants := make(models.Tenants, 0)
	defer rows.Close()

	for rows.Next() {
		tenant := &models.Tenant{}
		err := rows.Scan(&tenant.Id, &tenant.Name, &tenant.OwnerId, &tenant.Created)
		if err != nil {
			logger.Warn("get all users scan error", "error", err)
			continue
		}

		owner, _ := models.QueryUserById(c.Request.Context(), tenant.OwnerId)
		tenant.Owner = owner.Username

		tenants = append(tenants, tenant)
	}

	sort.Sort(tenants)
	c.JSON(200, common.RespSuccess(tenants))
}

func CreateTenant(c *gin.Context) {
	u := user.CurrentUser(c)

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

	res, err := tx.ExecContext(c.Request.Context(), `INSERT INTO tenant (name,owner_id,created,updated) VALUES (?,?,?,?)`, req.Name, u.Id, now, now)
	if err != nil {
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

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit sql transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

}

func QueryTenantUsers(c *gin.Context) {
	u := user.CurrentUser(c)

	rows, err := db.Conn.Query("SELECT user_id, role, created FROM tenant_user WHERE tenant_id=?", u.CurrentTenant)
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
		tenantUser.Username = user.Username
		tenantUser.RoleSortWeight = models.RoleSortWeight(tenantUser.Role)

		tenantUsers = append(tenantUsers, tenantUser)
	}

	sort.Sort(tenantUsers)

	c.JSON(200, common.RespSuccess(tenantUsers))
}

func SubmitTenantUser(c *gin.Context) {
	u := user.CurrentUser(c)

	req := &models.TenantUser{}
	c.Bind(&req)

	if req.Username == "" || !req.Role.IsValid() {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	targetUser, err := models.QueryUserByName(c.Request.Context(), req.Username)
	if err != nil {
		logger.Warn("query target user error when submit user", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if targetUser.Id == 0 {
		c.JSON(400, common.RespError(e.UserNotExist))
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

	if req.Role.IsAdmin() {
		// only super admin can delete admin in tenant
		if !u.TenantRole.IsSuperAdmin() {
			c.JSON(403, common.RespError("Only super admin can submit admin member"))
			return
		}
	} else {
		if !u.TenantRole.IsAdmin() {
			c.JSON(403, common.RespError(e.NoPermission))
			return
		}
	}

	now := time.Now()
	if req.Id == 0 {
		// insert
		_, err = db.Conn.ExecContext(c.Request.Context(), "INSERT INTO tenant_user (tenant_id,user_id,role,created,updated) VALUES (?,?,?,?,?)",
			u.CurrentTenant, targetUser.Id, req.Role, now, now)
		if err != nil {
			if e.IsErrUniqueConstraint(err) {
				c.JSON(400, common.RespError("user already in tenant"))
				return
			}
			logger.Warn("insert tenant user error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
	} else {
		// update
		_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE tenant_user SET role=?,updated=? WHERE tenant_id=? AND user_id=?",
			req.Role, now, u.CurrentTenant, targetUser.Id)
		if err != nil {
			logger.Warn("update tenant user error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
	}
}

func DeleteTenantUser(c *gin.Context) {
	targetUserId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if targetUserId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := user.CurrentUser(c)

	tenantUser, err := models.QueryTenantUser(c.Request.Context(), u.CurrentTenant, targetUserId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError(e.UserNotExist))
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

	if tenantUser.Role.IsAdmin() {
		// only super admin can delete admin in tenant
		if !u.TenantRole.IsSuperAdmin() {
			c.JSON(403, common.RespError(e.NoPermission))
			return
		}
	} else {
		if !u.TenantRole.IsAdmin() {
			c.JSON(403, common.RespError(e.NoPermission))
			return
		}
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), `DELETE FROM tenant_user WHERE tenant_id=? AND user_id=? AND role!=?`, u.CurrentTenant, targetUserId, models.ROLE_SUPER_ADMIN)
	if err != nil {
		logger.Warn("delete tenant user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
}
