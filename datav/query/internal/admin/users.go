// Copyright 2023 xObserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package admin

import (
	"database/sql"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/tenant"
	"github.com/xObserve/xObserve/query/internal/user"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/config"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
	"github.com/xObserve/xObserve/query/pkg/utils"
)

func GetUsers(c *gin.Context) {
	rows, err := db.Conn.QueryContext(c.Request.Context(), `SELECT id,username,name,email,mobile,role,status,last_seen_at,created,visit_count FROM user`)
	if err != nil {
		logger.Warn("get all users error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	users := make(models.Users, 0)
	defer rows.Close()

	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Role, &user.Status, &user.LastSeenAt, &user.Created, &user.Visits)
		if err != nil {
			logger.Warn("get all users scan error", "error", err)
			continue
		}

		users = append(users, user)
	}

	sort.Sort(users)
	c.JSON(200, common.RespSuccess(users))
}

func UpdateUser(c *gin.Context) {
	user.UpdateUserInfo(c)
}

type UpdateUserPasswordModel struct {
	Id       int64  `json:"id"`
	Password string `json:"password"`
}

func UpdateUserPassword(c *gin.Context) {
	req := &UpdateUserPasswordModel{}
	c.Bind(&req)

	u := c.MustGet("currentUser").(*models.User)
	if !u.Role.IsAdmin() {
		c.JSON(http.StatusForbidden, common.RespError("no permission"))
		return
	}

	targetUser, err := models.QueryUserById(c.Request.Context(), req.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusBadRequest, common.RespError(e.UserNotExist))
			return
		}
		c.JSON(http.StatusInternalServerError, common.RespInternalError())
		return
	}

	err1 := user.UpdatePassword(c.Request.Context(), targetUser, req.Password)
	if err1 != nil {
		c.JSON(err1.Status, common.RespError(err1.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

type AddUserModel struct {
	Username string          `json:"username"`
	Password string          `json:"password"`
	Role     models.RoleType `json:"role"`
	Email    string          `json:"email"`
}

func AddNewUser(c *gin.Context) {
	req := &AddUserModel{}
	c.Bind(&req)

	if req.Username == "" || req.Password == "" {
		c.JSON(400, common.RespError(e.UsernameOrPasswordEmpty))
		return
	}

	if !req.Role.IsValid() {
		c.JSON(400, common.RespError("user role is invalid"))
		return
	}

	u := c.MustGet("currentUser").(*models.User)

	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	// only superadmin can add Admin Role
	if req.Role.IsAdmin() {
		if !models.IsSuperAdmin(u.Id) {
			c.JSON(403, common.RespError("Only super admin can add admin role"))
			return
		}
	}

	salt, _ := utils.GetRandomString(10)
	encodedPW, _ := utils.EncodePassword(req.Password, salt)
	now := time.Now()

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("new user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	var tenantId int64
	if config.Data.Tenant.SyncWebsiteUsers {
		tenantId = models.DefaultTenantId
	}

	res, err := tx.ExecContext(c.Request.Context(), "INSERT INTO user (username,password,salt,email,role,current_tenant,created,updated) VALUES (?,?,?,?,?,?,?,?)",
		req.Username, encodedPW, salt, req.Email, req.Role, tenantId, now, now)
	if err != nil {
		logger.Warn("new user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	id, _ := res.LastInsertId()

	if tenantId != 0 {
		err = tenant.AddUserToTenant(id, tenantId, req.Role, tx, c.Request.Context())
		if err != nil {
			logger.Warn("new user error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		return
	}

	c.JSON(200, common.RespSuccess(&models.User{
		Id:       id,
		Username: req.Username,
		Email:    &req.Email,
		Created:  now,
		Updated:  now,
		Role:     req.Role,
	}))
}

type UpdateUserRoleModel struct {
	Id   int64           `json:"id"`
	Role models.RoleType `json:"role"`
}

func UpdateUserRole(c *gin.Context) {
	req := &UpdateUserRoleModel{}
	c.Bind(&req)

	if !req.Role.IsValid() {
		c.JSON(400, common.RespError("user role is invalid"))
		return
	}

	u := c.MustGet("currentUser").(*models.User)

	if req.Id == u.Id {
		c.JSON(400, common.RespError("you cant change your own role"))
		return
	}

	if req.Role == models.ROLE_ADMIN {
		if !u.Role.IsSuperAdmin() {
			c.JSON(403, common.RespError("only superadmin can set admin"))
			return
		}
	} else {
		if !u.Role.IsAdmin() {
			c.JSON(403, common.RespError(e.NoPermission))
			return
		}
	}

	_, err := db.Conn.Exec("UPDATE user SET role=? WHERE id=?",
		req.Role, req.Id)

	if err != nil {
		logger.Warn("update user role error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func MarkUserAsDeleted(c *gin.Context) {
	userId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if userId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	if userId == u.Id {
		c.JSON(400, common.RespError("you cant delete yourself"))
		return
	}

	if !models.IsSuperAdmin(u.Id) {
		c.JSON(403, common.RespError("only superadmin can delete user"))
		return
	}

	targetUser, err := models.QueryUserById(c.Request.Context(), userId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError(e.UserNotExist))
			return
		}
		logger.Warn("query target user error when delete user", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	_, err = db.Conn.Exec("UPDATE user SET status=? WHERE id=?", common.StatusDeleted, userId)
	if err != nil {
		logger.Warn("delete user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	_, err = db.Conn.Exec("DELETE FROM sessions WHERE user_id=?", userId)
	if err != nil {
		logger.Warn("delete user session error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	WriteAuditLog(c.Request.Context(), u.Id, AuditDeleteUser, strconv.FormatInt(userId, 10), targetUser)
	c.JSON(200, nil)
}

func RestoreUser(c *gin.Context) {
	userId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if userId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	if userId == u.Id {
		c.JSON(400, common.RespError("you cant delete yourself"))
		return
	}

	if !models.IsSuperAdmin(u.Id) {
		c.JSON(403, common.RespError("only superadmin can delete user"))
		return
	}

	targetUser, err := models.QueryUserById(c.Request.Context(), userId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError(e.UserNotExist))
			return
		}
		logger.Warn("query target user error when delete user", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	_, err = db.Conn.Exec("UPDATE user SET status=? WHERE id=?", common.StatusOK, userId)
	if err != nil {
		logger.Warn("delete user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	WriteAuditLog(c.Request.Context(), u.Id, AuditRestoreUser, strconv.FormatInt(userId, 10), targetUser)
}

func DeleteUser(userId int64) error {
	tx, err := db.Conn.Begin()
	if err != nil {
		return fmt.Errorf("new user error: %w", err)
	}
	defer tx.Rollback()

	_, err = db.Conn.Exec("DELETE FROM user WHERE id=?", userId)
	if err != nil {
		return fmt.Errorf("delete user error: %w", err)
	}

	_, err = db.Conn.Exec("DELETE FROM team_member WHERE user_id=?", userId)
	if err != nil {
		return fmt.Errorf("delete team member error: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("commit sql transaction error: %w", err)
	}

	return nil
}
