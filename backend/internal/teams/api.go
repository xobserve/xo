package teams

import (
	"github.com/codecc-com/datav/backend/internal/session"
	"database/sql"

	"github.com/codecc-com/datav/backend/internal/acl"
	"github.com/codecc-com/datav/backend/internal/invasion"
	"github.com/codecc-com/datav/backend/pkg/utils"

	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/codecc-com/datav/backend/pkg/common"
	"github.com/codecc-com/datav/backend/pkg/db"
	"github.com/codecc-com/datav/backend/pkg/i18n"
	"github.com/codecc-com/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

func GetTeams(c *gin.Context) {
	teams := make(models.Teams, 0)

	// user can see the teams he is in
	q := `SELECT id,name,created_by FROM team`
	if (!acl.IsGlobalAdmin(c)) {
		userId := session.CurrentUserId(c)
		members,err := models.QueryTeamMembersByUserId(userId)
		if err != nil {
			logger.Warn("get all teams error", "error", err)
			c.JSON(500, common.ResponseInternalError())
			return
		}

		if len(members) == 0 {
			c.JSON(200,common.ResponseSuccess(teams))
			return 	
		}
		
		if len(members) == 1 {
			q = fmt.Sprintf("%s WHERE id = '%d'",q,members[0].TeamId)
		} else {
			for i,m := range members {
				if (i == 0) {
					q = fmt.Sprintf("%s WHERE id in ('%d'",q,m.TeamId)
					continue
				}

				if (i == len(members)-1) {
					q = fmt.Sprintf("%s,'%d')",q,m.TeamId)
					continue
				}

				q = fmt.Sprintf("%s,'%d'",q,m.TeamId)
			}
		}
	}

	rows, err := db.SQL.Query(q)
	if err != nil {
		logger.Warn("get all teams error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}


	for rows.Next() {
		team := &models.Team{}
		err := rows.Scan(&team.Id, &team.Name, &team.CreatedById)
		if err != nil {
			logger.Warn("get all users scan error", "error", err)
			continue
		}
	
		user, _ := models.QueryUser(team.CreatedById, "", "")
		team.CreatedBy = user.Username

		count := 0
		err = db.SQL.QueryRow("SELECT count(*) FROM team_member WHERE team_id=?", team.Id).Scan(&count)
		if err != nil {
			logger.Warn("select team member count error", "error", err)
		}

		team.MemberCount = count
		teams = append(teams, team)
	}

	sort.Sort(teams)

	c.JSON(200, common.ResponseSuccess(teams))
}

func GetTeam(c *gin.Context) {
	id, _ := strconv.ParseInt(strings.TrimSpace(c.Query("id")), 10, 64)
	name := strings.TrimSpace(c.Query("name"))
	if id == 0 && name == "" {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	team, err := models.QueryTeam(id, name)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("get team  error", "error", err)
			c.JSON(500, common.ResponseInternalError())
			return 
		}
		
		c.JSON(200, common.ResponseSuccess(models.Team{}))
		return
	}

	c.JSON(200, common.ResponseSuccess(team))
}

func GetTeamMembers(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if id == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	members := make(models.TeamMembers, 0)
	rows, err := db.SQL.Query("SELECT user_id,role,created FROM team_member WHERE team_id=?", id)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get team members error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	for rows.Next() {
		member := &models.TeamMember{}
		err := rows.Scan(&member.Id, &member.Role, &member.Created)
		if err != nil {
			logger.Warn("get team members scan error", "error", err)
			continue
		}

		u, _ := models.QueryUser(member.Id, "", "")
		member.Username = u.Username
		member.RoleSortWeight = models.RoleSortWeight(member.Role)
		member.CreatedAge = utils.GetAgeString(member.Created)
		members = append(members, member)
	}

	sort.Sort(members)

	c.JSON(200, common.ResponseSuccess(members))
}

func GetTeamMember(c *gin.Context) {
	teamId,_ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	userId,_ := strconv.ParseInt(c.Param("userId"), 10, 64)

	if teamId == 0 || userId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	member, err := models.QueryTeamMember(teamId,userId)
	if err != nil {
		logger.Warn("get team member error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(member))
}

type AddMemberReq struct {
	MemberIds []int64         `json:"members"`
	Role      models.RoleType `json:"role"`
}

func AddTeamMembers(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	req := &AddMemberReq{}
	c.Bind(&req)

	members := req.MemberIds
	role := req.Role

	if teamId == models.GlobalTeamId {
		c.JSON(400, common.ResponseI18nError("error.addMemberToGlobal"))
		return	
	}

	if teamId == 0 || len(members) == 0 || !role.IsValid() {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	// only global admin and team admin can do this
	if !acl.IsGlobalAdmin(c) && !acl.IsTeamAdmin(teamId, c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	// if target role is admin, only global admin and team creator can do this
	if role.IsAdmin() {
		if !acl.IsGlobalAdmin(c) && !acl.IsTeamCreator(teamId, c) {
			c.JSON(403,common.ResponseI18nError(i18n.NoPermission))
			return
		}
	}
	// check team exists
	var id int64
	err := db.SQL.QueryRow("SELECT id FROM team WHERE id=?", teamId).Scan(&id)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get team error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	if id != teamId {
		c.JSON(400, common.ResponseI18nError(i18n.TeamNotExist))
		return
	}

	// check user exists
	for _, memberId := range members {
		var id int64
		err := db.SQL.QueryRow("SELECT id FROM user WHERE id=?", memberId).Scan(&id)
		if err != nil && err != sql.ErrNoRows {
			logger.Warn("get user error", "error", err)
			c.JSON(500, common.ResponseInternalError())
			return
		}
 
		if id != memberId {
			c.JSON(400, common.ResponseI18nError(i18n.UserNotExist))
			return
		}
	}

	now := time.Now()
	for _, memberId := range members {
		_, err := db.SQL.Exec("INSERT INTO team_member (team_id,user_id,role,created,updated) VALUES (?,?,?,?,?)", teamId, memberId, role, now, now)
		if err != nil {
			logger.Warn("add team member error", "error", err)
			c.JSON(500, common.ResponseInternalError())
			return
		}
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func DeleteTeamMember(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	memberId, _ := strconv.ParseInt(c.Param("memberId"), 10, 64)

	if teamId == 0 || memberId == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if teamId == models.GlobalTeamId {
		c.JSON(400, common.ResponseI18nError("error.deleteMemberInGlobal"))
		return	
	}

	team, err := models.QueryTeam(teamId, "")
	if err != nil && err != sql.ErrNoRows {
		c.JSON(500, common.ResponseInternalError())
		return
	}

	if err == sql.ErrNoRows  {
		c.JSON(400, common.ResponseI18nError(i18n.TeamNotExist))
		return
	}

	// cannot delete team creator
	if memberId == team.CreatedById {
		c.JSON(400, common.ResponseI18nError("error.deleteMemberTeamCreator"))
		return
	}

	if acl.IsUserSelf(memberId,c) {
		c.JSON(400, common.ResponseI18nError("error.deleteSelf"))
		return
	}

	hasPermission := canChangeTeamMember(teamId, memberId, c)
	if !hasPermission {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}



	_, err = db.SQL.Exec("DELETE FROM team_member where team_id=? and user_id=?", teamId, memberId)
	if err != nil {
		logger.Warn("delete team member error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func UpdateTeam(c *gin.Context) {
	team := &models.Team{}
	c.Bind(&team)

	if team.Id == 0 || team.Name == "" {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}


	if team.Id == models.GlobalTeamId {
		c.JSON(400, common.ResponseI18nError("error.globalTeamCantChange"))
		return	
	}

	if !acl.IsTeamAdmin(team.Id,c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	_, err := db.SQL.Exec("UPDATE team SET name=? WHERE id=?", team.Name, team.Id)
	if err != nil {
		logger.Warn("update team error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func UpdateTeamMember(c *gin.Context) {
	member := &models.TeamMember{}
	c.Bind(&member)

	if member.TeamId == 0 || member.Id == 0 || !member.Role.IsValid() {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	team, err := models.QueryTeam(member.TeamId, "")
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.ResponseI18nError(i18n.TeamNotExist))
			return 
		}
		c.JSON(500, common.ResponseInternalError())
		return
	}

	if member.Id == team.CreatedById && !member.Role.IsAdmin() {
		c.JSON(400, common.ResponseI18nError("error.teamCreatorRoleInvalid"))
		return
	}

	hasPermission := canChangeTeamMember(member.TeamId, member.Id, c)
	if !hasPermission {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	if member.Role.IsAdmin() {
		// only global admin and team creator can set team admin
		if !acl.IsGlobalAdmin(c) && !acl.IsTeamCreator(member.TeamId,c) {
			c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
			return
		}
	}

	_, err = db.SQL.Exec("UPDATE team_member SET role=?,updated=? WHERE team_id=? and user_id=?", member.Role, time.Now(), member.TeamId, member.Id)
	if err != nil {
		logger.Warn("update team member error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func TransferTeam(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	req := make(map[string]int64)
	c.Bind(&req)
	memberId := req["memberId"]

	if teamId == 0 || memberId == 0 {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	
	if teamId == models.GlobalTeamId {
		c.JSON(400, common.ResponseI18nError("error.globalTeamTransfer"))
		return	
	}

	// only global admin and team creator can transfer team
	if !acl.IsGlobalAdmin(c) && !acl.IsTeamCreator(teamId,c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	_, err := db.SQL.Exec("UPDATE team SET created_by=?,updated=? WHERE id=?", memberId, time.Now(), teamId)
	if err != nil {
		logger.Warn("update team  error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	// update new creator's team role to admin
	_, err = db.SQL.Exec("UPDATE team_member SET role=?,updated=? WHERE team_id=? and user_id=?",models.ROLE_ADMIN, time.Now(),  teamId,memberId)
	if err != nil {
		logger.Warn("update team member error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func DeleteTeam(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)

	if teamId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	// only global admin and team creator can delete team
	if !acl.IsGlobalAdmin(c) && !acl.IsTeamCreator(teamId,c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	} 
	
	if teamId == models.GlobalTeamId {
		c.JSON(400, common.ResponseI18nError("error.globalTeamDelete"))
		return	
	}

	_, err := db.SQL.Exec("DELETE FROM team WHERE id=?", teamId)
	if err != nil {
		logger.Warn("delete team  error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	_, err = db.SQL.Exec("DELETE FROM team_member WHERE team_id=?", teamId)
	if err != nil {
		logger.Warn("delete team member error", "error", err)
	}

	// delete team sidemenu
	_, err = db.SQL.Exec("DELETE FROM sidemenu WHERE team_id=?",teamId)
	if err != nil {
		logger.Warn("delete team member error", "error", err)
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func LeaveTeam(c *gin.Context) {
	teamId,_ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if teamId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	// team creator cannot leave team,must transfer team first
	if acl.IsTeamCreator(teamId, c) {
		c.JSON(400, common.ResponseI18nError("error.teamCreatorLeaveTeam"))
		return
	}

	if teamId == models.GlobalTeamId {
		c.JSON(400, common.ResponseI18nError("error.globalTeamLeave"))
		return	
	}

	userId := session.CurrentUserId(c)
	_, err := db.SQL.Exec("DELETE FROM team_member where team_id=? and user_id=?", teamId, userId)
	if err != nil {
		logger.Warn("leave team  error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200, common.ResponseSuccess(nil))
}

func GetTeamPermissions(c *gin.Context) {
	teamId,_ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if teamId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	permissions,err := models.QueryTeamPermissions(teamId)
	if err != nil {
		logger.Warn("query team permission error","error",err)
	}

	c.JSON(200, common.ResponseSuccess(permissions))
}

type UpdatePermissionReq struct {
	Role models.RoleType `json:"role"`
	Permission []int `json:"permission"`
}

func UpdateTeamPermission(c *gin.Context) {
	req := &UpdatePermissionReq{}
	c.Bind(&req)

	teamId,_ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if teamId == 0 {
		invasion.Add(c)
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}

	if !acl.IsTeamAdmin(teamId,c) {
		c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
		return
	}

	// must have CanView permission
	canViewExist := false 
	for _,p := range req.Permission {
		if p == models.CanView {
			canViewExist = true
		}
	}

	if (!canViewExist) {
		c.JSON(400, common.ResponseI18nError("error.mustHaveCanView"))
		return
	}
	
	_,err := db.SQL.Exec("DELETE FROM team_acl WHERE team_id=? and role=?",teamId,req.Role)
	if err != nil {
		logger.Warn("delete from team_acl error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}



	err = updatePermission(teamId, req.Role, req.Permission)
	if err != nil {
		logger.Warn("update team permission error", "error", err)
		c.JSON(500, common.ResponseInternalError())
		return
	}

	c.JSON(200,common.ResponseSuccess(nil))
}

func canChangeTeamMember(teamId, memberId int64, c *gin.Context) bool {
	if !acl.IsGlobalAdmin(c) && !acl.IsTeamCreator(teamId, c) {
		member, err := models.QueryTeamMember(teamId, memberId)
		if err != nil {
			logger.Warn("query team member error", "error", err)
			return false
		}
		if member.Role.IsAdmin() { //only global admin and team creator can delete team admin
			return false
		}
		if !acl.IsTeamAdmin(teamId, c) {
			return false
		}

	}

	return true
}
