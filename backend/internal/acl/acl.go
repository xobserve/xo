package acl

import (
	// "fmt"
	"github.com/code-creatively/datav/backend/pkg/models"
	"github.com/code-creatively/datav/backend/pkg/log"
	"github.com/code-creatively/datav/backend/internal/session"
	"github.com/gin-gonic/gin"
)

var logger = log.RootLogger.New("logger", "acl")

func IsSuperAdmin(c *gin.Context) bool {
	user := session.CurrentUser(c)
	if user.Username == models.SuperAdminUsername {
		return true
	}

	return false
}

func IsGlobalAdmin(c *gin.Context) bool {
	user := session.CurrentUser(c)
	return user.Role.IsAdmin()
}

func IsGlobalEditor(c *gin.Context) bool {
	user := session.CurrentUser(c)

	return user.Role.IsEditor()
}


func IsUserSelf(userId int64,c *gin.Context) bool {
	user := session.CurrentUser(c)
	return user.Id == userId
}

func IsTeamAdmin(teamId int64,c *gin.Context) bool {
	user := session.CurrentUser(c)
	if user.Role.IsAdmin() { //global admin is also team admin
		return true
	}


	teamMember, err := models.QueryTeamMember(teamId,user.Id)
	if err != nil {
		logger.Warn("query team member error","error",err)
		return false
	}

	if teamMember.Role.IsAdmin() {
		return true
	}

	return false
}

func IsTeamEditor(teamId int64,c *gin.Context) bool {
	user := session.CurrentUser(c)
	if user.Role.IsAdmin() { //global admin is also team editor
		return true
	}


	teamMember, err := models.QueryTeamMember(teamId,user.Id)
	if err != nil {
		logger.Warn("query team member error","error",err)
		return false
	}

	if teamMember.Role.IsEditor() {
		return true
	}

	return false
}


func IsTeamCreator(teamId int64,c *gin.Context) bool {
	team,err := models.QueryTeam(teamId,"")
	if err != nil {
		logger.Warn("query team  error","error",err)
		return false
	}
	
	userId := session.CurrentUserId(c)
	if team.CreatedById == userId {
		return true
	}

	return false
}

func CanViewDashboard(dashId int64,ownedBy int64, c *gin.Context) bool {
	if (IsSuperAdmin(c)) {
		return true
	}
	userId := session.CurrentUserId(c)
	userPermission := models.QueryUserHasDashboardPermssion(dashId,userId,models.CanView)

	if userPermission == models.UserAcl_PermissionForbidden {
		return false
	}

	if userPermission == models.UserAcl_PermissionAllow {
		return true
	}

	if IsGlobalAdmin(c) {
		return true
	}

	teamIds,_ := models.QueryAclTeamIds(dashId)

	teamIds = append(teamIds,ownedBy)



	// check user is in these teams
	for _,teamId := range teamIds {
		member, err := models.QueryTeamMember(teamId,userId)
		if err != nil {
			logger.Warn("get team error","error",err)
			continue
		}

		if member.Id == userId {
			return true
		}
	}

	return false
}

func CanEditDashboard(dashId int64,ownedBy int64, c*gin.Context) bool {
	if (IsSuperAdmin(c)) {
		return true
	}

	userId := session.CurrentUserId(c)
	userPermission := models.QueryUserHasDashboardPermssion(dashId,userId,models.CanEdit)
	if userPermission == models.UserAcl_PermissionForbidden {
		return false
	}

	if userPermission == models.UserAcl_PermissionAllow {
		return true
	}

	if IsGlobalAdmin(c) {
		return true
	}


	member, err := models.QueryTeamMember(ownedBy,userId)
	if err != nil {
		logger.Warn("get team error","error",err)
		return false
	}

	if member.Id != userId {
		return false
	}

	ok,err := models.TeamRoleHasPermission(ownedBy,member.Role,models.CanEdit)
	if err != nil {
		logger.Warn("get team permission error","error",err,"team_id",ownedBy,"role",member.Role)
		return false
	}

	return ok
}

func CanAddDashboard(ownedBy int64, c*gin.Context) bool {
	if IsGlobalAdmin(c) {
		return true
	}

	userId := session.CurrentUserId(c)

	member, err := models.QueryTeamMember(ownedBy,userId)
	if err != nil {
		logger.Warn("get team error","error",err)
		return false
	}

	if member.Id != userId {
		return false
	}

	ok,err := models.TeamRoleHasPermission(ownedBy,member.Role,models.CanAdd)
	if err != nil {
		logger.Warn("get team permission error","error",err,"team_id",ownedBy,"role",member.Role)
		return false
	}

	return ok
}

func CanSaveDashboard(dashId int64, ownedBy int64, c*gin.Context) bool {
	if (IsSuperAdmin(c)) {
		return true
	}

	userId := session.CurrentUserId(c)
	if dashId != 0 {
		userPermission := models.QueryUserHasDashboardPermssion(dashId,userId,models.CanSave)
		if userPermission == models.UserAcl_PermissionForbidden {
			return false
		}

		if userPermission == models.UserAcl_PermissionAllow {
			return true
		}
	}


	if IsGlobalAdmin(c) {
		return true
	}
 

	member, err := models.QueryTeamMember(ownedBy,userId)
	if err != nil {
		logger.Warn("get team error","error",err)
		return false
	}

	if member.Id != userId {
		return false
	}

	ok,err := models.TeamRoleHasPermission(ownedBy,member.Role,models.CanSave)
	if err != nil {
		logger.Warn("get team permission error","error",err,"team_id",ownedBy,"role",member.Role)
		return false
	}

	return ok
}

func CanAdminDashboard(dashId int64,ownedBy int64, c*gin.Context) bool {
	if (IsSuperAdmin(c)) {
		return true
	}
	
	userId := session.CurrentUserId(c)
	userPermission := models.QueryUserHasDashboardPermssion(dashId,userId,models.CanMangePermission)
	if userPermission == models.UserAcl_PermissionForbidden {
		return false
	}

	if userPermission == models.UserAcl_PermissionAllow {
		return true
	}

	if IsGlobalAdmin(c) {
		return true
	}


	member, err := models.QueryTeamMember(ownedBy,userId)
	if err != nil {
		logger.Warn("get team error","error",err)
		return false
	}

	if member.Id != userId {
		return false
	}

	if member.Role.IsAdmin() {
		return true
	}

	return false
}