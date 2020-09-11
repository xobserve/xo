package admin

import (
	"github.com/code-creatively/datav/backend/internal/teams"
	"github.com/code-creatively/datav/backend/internal/acl"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/code-creatively/datav/backend/internal/session"
	"github.com/code-creatively/datav/backend/pkg/common"
	"github.com/code-creatively/datav/backend/pkg/db"
	"github.com/code-creatively/datav/backend/pkg/i18n"
	"github.com/code-creatively/datav/backend/pkg/models"
	"github.com/code-creatively/datav/backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

func NewUser(c *gin.Context) {
	req := make(map[string]string)
	c.Bind(&req)
	username := strings.TrimSpace(req["username"])
	password := strings.TrimSpace(req["password"])
	email := strings.TrimSpace(req["email"])
	role := models.RoleType(strings.TrimSpace(req["role"]))
	if username == "" || password == "" {
		c.JSON(400, common.ResponseI18nError(i18n.UserNameOrPasswordEmpty))
		return
	}

	if !role.IsValid() {
		c.JSON(400, common.ResponseI18nError("error.badUserRole"))
		return
	}

	if email == "" {
		email = fmt.Sprintf("%s@localhost", username)
	}

	if !acl.IsGlobalAdmin(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	// only superadmin can add Admin Role
	if role.IsAdmin() {
		if !acl.IsSuperAdmin(c) {
			c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
			return
		} 
	}

	salt, _ := utils.GetRandomString(10)
	encodedPW, _ := utils.EncodePassword(password, salt)
	now := time.Now()

	res, err := db.SQL.Exec("INSERT INTO user (username,password,salt,email,created,updated) VALUES (?,?,?,?,?,?)",
		username, encodedPW, salt, email, now, now)
	if err != nil {
		logger.Warn("new user error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	id, _ := res.LastInsertId()

	// add user to global team
	_,err = db.SQL.Exec("INSERT INTO team_member (team_id,user_id,role,created,updated) VALUES (?,?,?,?,?)",
	models.GlobalTeamId,id,role,now,now)
	if err != nil {
		logger.Warn("new user error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(&models.User{
		Id:       id,
		Username: username,
		Email:    email,
		Created:  now,
		Updated:  now,
		Role:     role,
	}))
}

func DeleteUser(c *gin.Context) {
	userId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if userId == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	currentUser := session.CurrentUser(c)
	if userId == currentUser.Id {
		c.JSON(400, common.ResponseI18nError("error.deleteSelf"))
		return
	}


	if !acl.IsGlobalAdmin(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	targetUser,err := models.QueryUser(userId,"","")
	if err != nil {
		logger.Warn("query user error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	if targetUser.Role.IsAdmin() {
		// only super admin can do this
		if !acl.IsSuperAdmin(c) {
			c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
			return
		}
	}

	if targetUser.Username == models.SuperAdminUsername {
		c.JSON(400,common.ResponseI18nError("error.changeAdminUser"))
		return 
	}

	var teamCount int
	err = db.SQL.QueryRow("SELECT count(*) FROM team WHERE created_by=?",userId).Scan(&teamCount)
	if err != nil {
		logger.Warn("delete user error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	if teamCount > 0 {
		c.JSON(400,common.ResponseI18nError("deleteUserHasTeams"))
		return 
	}

	_, err = db.SQL.Exec("DELETE FROM user WHERE id=?", userId)
	if err != nil {
		logger.Warn("delete user error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	_, err = db.SQL.Exec("DELETE FROM team_member WHERE user_id=?", userId)
	if err != nil {
		logger.Warn("delete team member error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}


	c.JSON(200, nil)
}

func UpdateUser(c *gin.Context) {
	user := &models.User{}
	c.Bind(&user)

	if !user.Role.IsValid() {
		c.JSON(400, common.ResponseI18nError("error.badUserRole"))
		return
	}
	
	if !acl.IsGlobalAdmin(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}
	
	
	// if user want to be role admin or is role admin, need super admin to do this
	oldUser,err := models.QueryUser(user.Id,"","")
	if err != nil {
		logger.Warn("query old user error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	if !acl.IsUserSelf(user.Id,c) {
		if user.Role.IsAdmin() || oldUser.Role.IsAdmin() {
			if !acl.IsSuperAdmin(c) {
				c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
				return
			} 
		}
	
		// super admin's user name can't be changed
		if oldUser.Username == models.SuperAdminUsername {
			if user.Username != models.SuperAdminUsername  {
				c.JSON(400,common.ResponseI18nError("error.changeAdminUser"))
				return 
			}
	
			if !user.Role.IsAdmin() {
				c.JSON(400,common.ResponseI18nError("error.changeAdminUser"))
				return 
			}
		}
	}
	
	now := time.Now()
	_, err = db.SQL.Exec("UPDATE user SET username=?,name=?,email=?,updated=? WHERE id=?",
		user.Username, user.Name, user.Email, now, user.Id)
	if err != nil {
		logger.Warn("update user error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	_, err = db.SQL.Exec("UPDATE team_member SET role=?,updated=? WHERE team_id=? and user_id=?",
		user.Role,now,models.GlobalTeamId,user.Id)
	if err != nil {
		logger.Warn("update user error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func UpdatePassword(c *gin.Context) {
	req := make(map[string]string)
	c.Bind(&req)

	userId, _ := strconv.ParseInt(req["id"], 10, 64)
	password := req["password"]

	if userId == 0 || password == "" {
		c.JSON(400,common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	user,err := models.QueryUser(userId,"","")
	if err != nil {
		c.JSON(500, common.ResponseInternalError())
		return 
	}

	if user.Id == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.UserNotExist))
		return
	}

	encodedPW, _ := utils.EncodePassword(password, user.Salt)

	if !acl.IsGlobalAdmin(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}
	
	if user.Role.IsAdmin() {
		if !acl.IsSuperAdmin(c) && !acl.IsUserSelf(userId,c) {
			c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
			return
		} 
	}

	if user.Username == models.SuperAdminUsername {
		if !acl.IsSuperAdmin(c) {
			c.JSON(400,common.ResponseI18nError("error.changeAdminUser"))
			return 
		}
	}

	_, err = db.SQL.Exec("UPDATE user SET password=?,updated=? WHERE id=?",
		encodedPW, time.Now(), user.Id)
	if err != nil {
		logger.Warn("update user password error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}



func NewTeam(c *gin.Context) {
	req := make(map[string]string)
	c.Bind(&req)
	name := strings.TrimSpace(req["name"])
	if name == "" {
		c.JSON(400,common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if name == models.GlobalTeamName {
		c.JSON(400, common.ResponseI18nError(i18n.TeamAlreadyExist))
		return
	}

	if !acl.IsGlobalAdmin(c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	now := time.Now()

	user := session.CurrentUser(c)
	res, err := db.SQL.Exec("INSERT INTO team (name,created_by,created,updated) VALUES (?,?,?,?)",
		name, user.Id, now, now)
	if err != nil {
		logger.Warn("new team error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	id, _ := res.LastInsertId()

	// insert self as first team member
	_,err = db.SQL.Exec("INSERT INTO team_member (team_id,user_id,role,created,updated) VALUES (?,?,?,?,?)",id,user.Id,models.ROLE_ADMIN,now,now)
	if err != nil {
		logger.Warn("insert team member error", "error", err)
		db.SQL.Exec("DELETE FROM team WHERE id=?",id)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	// init team permission
	teams.InitTeamPermission(id)
	
	c.JSON(200, common.ResponseSuccess(&models.Team{
		Id:       id,
		Name:  name,
		CreatedBy: user.Username, 
		Created:  now,
		Updated:  now,
		MemberCount: 1,
	}))
}
