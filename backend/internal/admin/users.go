// Copyright 2023 Datav.io Team
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
	"encoding/json"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/DataObserve/datav/backend/internal/teams"
	"github.com/DataObserve/datav/backend/internal/user"
	"github.com/DataObserve/datav/backend/pkg/common"
	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/DataObserve/datav/backend/pkg/e"
	"github.com/DataObserve/datav/backend/pkg/models"
	"github.com/DataObserve/datav/backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	rows, err := db.Conn.Query(`SELECT id,username,name,email,mobile,last_seen_at,created FROM user`)
	if err != nil {
		logger.Warn("get all users error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	users := make(models.Users, 0)
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.LastSeenAt, &user.Created)
		if err != nil {
			logger.Warn("get all users scan error", "error", err)
			continue
		}

		if user.Id == models.SuperAdminId {
			user.Role = models.ROLE_SUPER_ADMIN
		} else {
			globalMember, err := models.QueryTeamMember(models.GlobalTeamId, user.Id)
			if err != nil {
				logger.Warn("get all users team member error", "error", err)
				continue
			}

			user.Role = globalMember.Role
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

	u := user.CurrentUser(c)
	if !u.Role.IsAdmin() {
		c.JSON(http.StatusForbidden, common.RespError("no permission"))
		return
	}

	targetUser, err := models.QueryUserById(req.Id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, common.RespInternalError())
		return
	}

	err1 := user.UpdatePassword(targetUser, req.Password)
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

	u := user.CurrentUser(c)

	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	// only superadmin can add Admin Role
	if req.Role.IsAdmin() {
		if !models.IsSuperAdmin(u.Id) {
			c.JSON(403, common.RespError(e.NoPermission))
			return
		}
	}

	salt, _ := utils.GetRandomString(10)
	encodedPW, _ := utils.EncodePassword(req.Password, salt)
	now := time.Now()

	res, err := db.Conn.Exec("INSERT INTO user (username,password,salt,email,created,updated) VALUES (?,?,?,?,?,?)",
		req.Username, encodedPW, salt, req.Email, now, now)
	if err != nil {
		logger.Warn("new user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	id, _ := res.LastInsertId()

	// add user to global team
	_, err = db.Conn.Exec("INSERT INTO team_member (team_id,user_id,role,created,updated) VALUES (?,?,?,?,?)",
		models.GlobalTeamId, id, req.Role, now, now)
	if err != nil {
		logger.Warn("new user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(&models.User{
		Id:       id,
		Username: req.Username,
		Email:    req.Email,
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

	u := user.CurrentUser(c)
	if !models.IsSuperAdmin(u.Id) {
		c.JSON(403, common.RespError("only superadmin can update user role"))
		return
	}

	_, err := db.Conn.Exec("UPDATE team_member SET role=? WHERE team_id=? AND user_id=?",
		req.Role, models.GlobalTeamId, req.Id)

	if err != nil {
		logger.Warn("update user role error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func DeleteUser(c *gin.Context) {
	userId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if userId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	currentUser := user.CurrentUser(c)
	if userId == currentUser.Id {
		c.JSON(400, common.RespError("you cant delete yourself"))
		return
	}

	if !models.IsSuperAdmin(currentUser.Id) {
		c.JSON(403, common.RespError("only superadmin can delete user"))
		return
	}

	targetUser, err := models.QueryUserById(userId)
	if err != nil {
		logger.Warn("query target user error when delete user", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if targetUser.Id == 0 {
		c.JSON(400, common.RespError(e.UserNotExist))
		return
	}

	_, err = db.Conn.Exec("DELETE FROM user WHERE id=?", userId)
	if err != nil {
		logger.Warn("delete user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	_, err = db.Conn.Exec("DELETE FROM team_member WHERE user_id=?", userId)
	if err != nil {
		logger.Warn("delete team member error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	WriteAuditLog(currentUser.Id, AuditDeleteUser, strconv.FormatInt(userId, 10), targetUser)
	c.JSON(200, nil)
}

type AddNewTeamModel struct {
	Name  string `json:"name"`
	Brief string `json:"brief"`
}

func AddNewTeam(c *gin.Context) {
	req := &AddNewTeamModel{}
	c.Bind(&req)
	if req.Name == "" {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	if req.Name == models.GlobalTeamName {
		c.JSON(400, common.RespError("name is already used for global team"))
		return
	}

	u := user.CurrentUser(c)
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	now := time.Now()

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("new team error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	res, err := tx.Exec("INSERT INTO team (name,brief,created_by,created,updated) VALUES (?,?,?,?,?)",
		req.Name, req.Brief, u.Id, now, now)
	if err != nil {
		logger.Warn("new team error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	id, _ := res.LastInsertId()

	// insert self as first team member
	_, err = tx.Exec("INSERT INTO team_member (team_id,user_id,role,created,updated) VALUES (?,?,?,?,?)", id, u.Id, models.ROLE_ADMIN, now, now)
	if err != nil {
		logger.Warn("insert team member error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	// copy global team's sidemenu to new team
	gMenu, err := teams.QuerySideMenu(0, models.GlobalTeamId)
	if err != nil {
		logger.Warn("query team sidemenu error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	data, _ := json.Marshal(gMenu.Data)
	_, err = tx.Exec("INSERT INTO sidemenu (team_id,is_public,brief,data,created_by,created,updated) VALUES (?,?,?,?,?,?,?)",
		id, false, "team's sidemenu,copied from global team initially", data, u.Id, now, now)
	if err != nil {
		logger.Error("create sidemenu error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	err = tx.Commit()
	if err != nil {
		logger.Warn("commit sql transaction error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(&models.Team{
		Id:          id,
		Name:        req.Name,
		Brief:       req.Brief,
		CreatedBy:   u.Username,
		Created:     now,
		Updated:     now,
		MemberCount: 1,
	}))
}
