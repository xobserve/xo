// Copyright 2023 xobserve.io Team
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
package teams

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/acl"
	"github.com/xObserve/xObserve/query/internal/admin"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "teams")

func GetTenantTeams(c *gin.Context) {
	tenantId, _ := strconv.ParseInt(c.Param("tenantId"), 10, 64)
	ctx := c.Request.Context()
	u := c.MustGet("currentUser").(*models.User)

	_, err := models.QueryTenantUser(ctx, tenantId, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError(e.NotTenantUser))
			return
		}
		logger.Warn("query tenant user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	rows, err := db.Conn.QueryContext(ctx, `SELECT id,name,brief,status,created_by FROM team WHERE tenant_id=?`, tenantId)
	if err != nil {
		logger.Warn("get all users error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer rows.Close()

	teams := make(models.Teams, 0)
	for rows.Next() {
		team := &models.Team{}
		err := rows.Scan(&team.Id, &team.Name, &team.Brief, &team.Status, &team.CreatedById)
		if err != nil {
			logger.Warn("get all users scan error", "error", err)
			continue
		}

		user, _ := models.QueryUserById(ctx, team.CreatedById)
		if user != nil {
			team.CreatedBy = user.Username
		}

		count := 0
		err = db.Conn.QueryRowContext(ctx, "SELECT count(*) FROM team_member WHERE team_id=?", team.Id).Scan(&count)
		if err != nil {
			logger.Warn("select team member count error", "error", err)
		}

		team.MemberCount = count
		if u != nil {
			member, _ := models.QueryTeamMember(ctx, team.Id, u.Id)
			if member != nil {
				team.CurrentUserRole = member.Role
			}
		} else {
			team.CurrentUserRole = models.ROLE_VIEWER
		}

		teams = append(teams, team)
	}

	sort.Sort(teams)

	c.JSON(200, common.RespSuccess(teams))
}

func GetVisibleTeamsByTenantId(ctx context.Context, tenantId int64, u *models.User) (models.Teams, error) {
	teams, err := models.QueryTeamsUserInTenant(ctx, tenantId, u.Id)
	if err != nil {
		return nil, err
	}
	// teams := make(models.Teams, 0)
	// q := fmt.Sprintf(basicTeamQuery, tenantId)

	// if u == nil {
	// 	q = fmt.Sprintf("%s AND is_public=true", q)
	// } else {
	// 	// user can see the teams he is in
	// 	if !u.Role.IsAdmin() {
	// 		members, err := models.QueryVisibleTeamsByUserId(ctx, tenantId, u.Id)
	// 		if err != nil {
	// 			return nil, err
	// 		}

	// 		if len(members) == 0 {
	// 			return teams, nil
	// 		}

	// 		if len(members) == 1 {
	// 			q = fmt.Sprintf("%s AND id = '%d'", q, members[0])
	// 		} else {
	// 			for i, m := range members {
	// 				if i == 0 {
	// 					q = fmt.Sprintf("%s AND id in ('%d'", q, m)
	// 					continue
	// 				}

	// 				if i == len(members)-1 {
	// 					q = fmt.Sprintf("%s,'%d')", q, m)
	// 					continue
	// 				}

	// 				q = fmt.Sprintf("%s,'%d'", q, m)
	// 			}
	// 		}
	// 	}
	// }

	// rows, err := db.Conn.QueryContext(ctx, q)
	// if err != nil {
	// 	return nil, err
	// }
	// defer rows.Close()
	// for rows.Next() {
	// 	team := &models.Team{}
	// 	err := rows.Scan(&team.Id, &team.Name, &team.Brief, &team.IsPublic, &team.CreatedById)
	// 	if err != nil {
	// 		logger.Warn("get all users scan error", "error", err)
	// 		continue
	// 	}

	// 	user, _ := models.QueryUserById(ctx, team.CreatedById)
	// 	team.CreatedBy = user.Username

	// 	count := 0
	// 	err = db.Conn.QueryRowContext(ctx, "SELECT count(*) FROM team_member WHERE team_id=?", team.Id).Scan(&count)
	// 	if err != nil {
	// 		logger.Warn("select team member count error", "error", err)
	// 	}

	// 	team.MemberCount = count
	// 	if u != nil {
	// 		member, _ := models.QueryTeamMember(ctx, team.Id, u.Id)
	// 		if member != nil {
	// 			team.CurrentUserRole = member.Role
	// 		}
	// 	} else {
	// 		team.CurrentUserRole = models.ROLE_VIEWER
	// 	}

	// 	teams = append(teams, team)
	// }

	sort.Sort(models.Teams(teams))

	return teams, nil
}
func GetTeam(c *gin.Context) {
	id, _ := strconv.ParseInt(strings.TrimSpace(c.Param("id")), 10, 64)
	if id == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	var userId int64
	if u != nil {
		userId = u.Id
	}

	team, err := models.QueryTeam(c.Request.Context(), id, "")
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("get team  error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}

		c.JSON(200, common.RespSuccess(models.Team{}))
		return
	}

	if team.Status == common.StatusDeleted {
		c.JSON(400, common.RespError(e.TeamBeenDeleted))
		return
	}

	err = acl.CanViewTeam(c.Request.Context(), team.Id, userId)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	c.JSON(200, common.RespSuccess(team))
}

func GetTeamMembers(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if id == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	var userId int64
	if u != nil {
		userId = u.Id
	}

	err := acl.CanViewTeam(c.Request.Context(), id, userId)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	members := make(models.TeamMembers, 0)
	rows, err := db.Conn.QueryContext(c.Request.Context(), "SELECT user_id,role,created FROM team_member WHERE team_id=?", id)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get team members error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer rows.Close()
	for rows.Next() {
		member := &models.TeamMember{}
		err := rows.Scan(&member.Id, &member.Role, &member.Created)
		if err != nil {
			logger.Warn("get team members scan error", "error", err)
			continue
		}

		u, _ := models.QueryUserById(c.Request.Context(), member.Id)
		if u != nil {
			member.Username = u.Username
		}
		member.RoleSortWeight = models.RoleSortWeight(member.Role)
		member.TeamId = id
		members = append(members, member)
	}

	sort.Sort(members)

	c.JSON(200, common.RespSuccess(members))
}

type AddMemberReq struct {
	TeamId  int64           `json:"teamId"`
	Members []string        `json:"members"`
	Role    models.RoleType `json:"role"`
}

func AddTeamMembers(c *gin.Context) {
	req := &AddMemberReq{}
	c.Bind(&req)

	members := req.Members
	role := req.Role

	if req.TeamId == 0 || len(members) == 0 || !role.IsValid() {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)

	err := acl.CanEditTeam(c.Request.Context(), req.TeamId, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	team, err := models.QueryTeam(c.Request.Context(), req.TeamId, "")
	if err != nil {
		logger.Warn("get team error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	memberIds := make([]int64, 0)
	// check whether user is in current tenant
	for _, member := range members {
		memberId, err := models.QueryUserIdByName(member)
		if err != nil {
			logger.Warn("Get user id by name error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
		inTenant, err := models.IsUserInTenant(memberId, team.TenantId)
		if err != nil {
			logger.Warn("check user in tenant error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
		if !inTenant {
			c.JSON(400, common.RespError(fmt.Sprintf("user %s is not in current tenant", member)))
			return
		}

		memberIds = append(memberIds, memberId)
	}

	for _, memberId := range memberIds {
		err = AddTeamMember(c.Request.Context(), team.TenantId, req.TeamId, memberId, role)
		if err != nil {
			logger.Warn("add team member error", "error", err)
			c.JSON(400, common.RespError(err.Error()))
			return
		}
	}

	c.JSON(200, common.RespSuccess(nil))
}

func AddTeamMember(ctx context.Context, tenantId int64, teamId int64, userId int64, role models.RoleType) error {
	now := time.Now()
	_, err := db.Conn.ExecContext(ctx, "INSERT INTO team_member (tenant_id,team_id,user_id,role,created,updated) VALUES (?,?,?,?,?,?)", tenantId, teamId, userId, role, now, now)
	if err != nil {
		return fmt.Errorf("add team member error: %w", err)
	}

	return nil
}
func DeleteTeamMember(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	memberId, _ := strconv.ParseInt(c.Param("memberId"), 10, 64)

	if teamId == 0 || memberId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	if memberId == u.Id {
		c.JSON(400, common.RespError("cannot delete yourself"))
		return
	}

	member, err := models.QueryTeamMember(c.Request.Context(), teamId, memberId)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("member not exist"))
			return
		}
		logger.Warn("query team member error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	operator, err := models.QueryTeamMember(c.Request.Context(), teamId, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("You are not in current team"))
			return
		}
		logger.Warn("query team member error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if member.Role == models.ROLE_SUPER_ADMIN {
		c.JSON(400, common.RespError("cannot delete super admin"))
		return
	}

	if member.Role == models.ROLE_ADMIN {
		if operator.Role != models.ROLE_SUPER_ADMIN {
			c.JSON(400, common.RespError("only super admin can delete admin"))
			return
		}
	}

	if !operator.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "DELETE FROM team_member where team_id=? and user_id=?", teamId, memberId)
	if err != nil {
		logger.Warn("delete team member error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func UpdateTeam(c *gin.Context) {
	team := &models.Team{}
	c.Bind(&team)

	if team.Id == 0 || team.Name == "" {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}
	u := c.MustGet("currentUser").(*models.User)
	err := acl.CanEditTeam(c.Request.Context(), team.Id, u.Id)
	if err != nil {
		c.JSON(403, common.RespError(err.Error()))
		return
	}

	oldTeam, err := models.QueryTeam(c.Request.Context(), team.Id, "")
	if err != nil {
		logger.Warn("query team error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	now := time.Now()
	if !oldTeam.SyncUsers && team.SyncUsers {
		var tenantUsers []int64
		rows, err := db.Conn.QueryContext(c.Request.Context(), "SELECT user_id FROM tenant_user WHERE tenant_id=?", oldTeam.TenantId)
		if err != nil {
			logger.Warn("query tenant users error", "error", err)
			c.JSON(500, common.RespInternalError())
			return
		}
		defer rows.Close()
		for rows.Next() {
			var userId int64
			err := rows.Scan(&userId)
			if err != nil {
				logger.Warn("scan tenant users error", "error", err)
				continue
			}
			tenantUsers = append(tenantUsers, userId)
		}

		for _, userId := range tenantUsers {
			err = AddTeamMember(c.Request.Context(), oldTeam.TenantId, oldTeam.Id, userId, models.ROLE_VIEWER)
			if err != nil && !e.IsErrUniqueConstraint(err) {
				logger.Warn("add team member error", "error", err)
				c.JSON(400, common.RespError(err.Error()))
				return
			}
		}

	}
	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE team SET name=?, sync_users=?, updated=? WHERE id=?", team.Name, team.SyncUsers, now, team.Id)
	if err != nil {
		logger.Warn("update team error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func UpdateTeamMember(c *gin.Context) {
	req := &models.TeamMember{}
	c.Bind(&req)

	if req.TeamId == 0 || req.Id == 0 || !req.Role.IsValid() {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	if req.Id == u.Id {
		c.JSON(400, common.RespError("cannot change your own role"))
		return
	}

	member, err := models.QueryTeamMember(c.Request.Context(), req.TeamId, req.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("member not exist"))
			return
		}
		logger.Warn("query team member error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	operator, err := models.QueryTeamMember(c.Request.Context(), req.TeamId, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("You are not in current team"))
			return
		}
		logger.Warn("query team member error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if req.Role == models.ROLE_SUPER_ADMIN {
		c.JSON(400, common.RespError("cannot change role to super admin"))
		return
	}

	if req.Role == models.ROLE_ADMIN || member.Role == models.ROLE_ADMIN {
		if operator.Role != models.ROLE_SUPER_ADMIN {
			c.JSON(400, common.RespError("only super admin can change role  admin"))
			return
		}
	}

	if !operator.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE team_member SET role=?,updated=? WHERE team_id=? and user_id=?", req.Role, time.Now(), req.TeamId, req.Id)
	if err != nil {
		logger.Warn("update team member error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func MarkDeleted(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	if teamId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)

	operator, err := models.QueryTeamMember(c.Request.Context(), teamId, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("You are not in current team"))
			return
		}
		logger.Warn("query team member error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if !operator.Role.IsSuperAdmin() {
		c.JSON(403, common.RespError("Only super admin can do this"))
		return
	}

	t, err := models.QueryTeam(c.Request.Context(), teamId, "")
	if err != nil {
		logger.Warn("query team error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	// check tenant has more than one team
	var teamCount int
	err = db.Conn.QueryRow("SELECT count(*) FROM team WHERE tenant_id=? and status!=?", t.TenantId, common.StatusDeleted).Scan(&teamCount)
	if err != nil {
		logger.Warn("query team count error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if teamCount <= 1 {
		c.JSON(400, common.RespError("tenant must have at least one team"))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE team SET status=?,statusUpdated=? WHERE id=?", common.StatusDeleted, time.Now(), teamId)
	if err != nil {
		logger.Warn("set team to deleted error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	admin.WriteAuditLog(c.Request.Context(), t.TenantId, teamId, u.Id, admin.AuditDeleteTeam, strconv.FormatInt(teamId, 10), t)
}

func RestoreTeam(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	if teamId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)

	t, err := models.QueryTeam(c.Request.Context(), teamId, "")
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError(e.TeamNotExist))
			return
		}
		logger.Warn("query team error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	operator, err := models.QueryTenantUser(c.Request.Context(), t.TenantId, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("You are not in current team"))
			return
		}
		logger.Warn("query team member error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	if !operator.Role.IsSuperAdmin() {
		c.JSON(403, common.RespError("Only super admin can do this"))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "UPDATE team SET status=?,statusUpdated=? WHERE id=?", common.StatusOK, time.Now(), teamId)
	if err != nil {
		logger.Warn("set team to ok error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	admin.WriteAuditLog(c.Request.Context(), t.TenantId, teamId, u.Id, admin.AuditRestoreTeam, strconv.FormatInt(teamId, 10), t)
}

func LeaveTeam(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if teamId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	member, err := models.QueryTeamMember(c.Request.Context(), teamId, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("You are not in current team"))
			return
		}
		logger.Warn("check team admin error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	// if user is team admin, can't leave team, he must degrade to normal member first
	if member.Role.IsSuperAdmin() {
		c.JSON(400, common.RespError("team super admin can't leave team, please transfer team to other member first"))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "DELETE FROM team_member where team_id=? and user_id=?", teamId, u.Id)
	if err != nil {
		logger.Warn("leave team  error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
}

func SwitchTeam(c *gin.Context) {
	u := c.MustGet("currentUser").(*models.User)
	teamId := c.Param("teamId")

	err := SetTeamForUser(c.Request.Context(), teamId, u.Id)
	if err != nil {
		logger.Warn("update side menu error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func SetTeamForUser(ctx context.Context, teamId string, userId int64) error {
	_, err := db.Conn.ExecContext(ctx, "UPDATE user SET current_team=? WHERE id=?", teamId, userId)
	if err != nil {
		return err
	}

	return nil
}

func GetTeamsForUser(c *gin.Context) {
	tenantId, _ := strconv.ParseInt(c.Query("tenantId"), 10, 64)
	if tenantId == 0 {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	teams := make([]*models.Team, 0)

	teams0, err := models.QueryTeamsUserInTenant(c.Request.Context(), tenantId, u.Id)
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
			teams = append(teams, team)
		}
	}

	c.JSON(200, common.RespSuccess(teams))
}

type AddNewTeamModel struct {
	Name     string `json:"name"`
	Brief    string `json:"brief"`
	TenantId int64  `json:"tenantId"`
}

func AddNewTeam(c *gin.Context) {
	req := &AddNewTeamModel{}
	c.Bind(&req)
	if req.Name == "" {
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}

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

	if !tenantRole.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	now := time.Now()
	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("create team error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	id, err := models.CreateTeam(c.Request.Context(), tx, req.TenantId, u.Id, req.Name, req.Brief)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			c.JSON(400, common.RespError("team name already exist"))
			return
		}
		logger.Warn("create team error", "error", err)
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

func TransferTeam(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	if teamId == 0 {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}
	transferTo := c.Param("username")

	u := c.MustGet("currentUser").(*models.User)

	operator, err := models.QueryTeamMember(c.Request.Context(), teamId, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("You are not in current team"))
			return
		}
		logger.Warn("get team user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	// only superadmin can transfer tenant
	if !operator.Role.IsSuperAdmin() {
		c.JSON(403, common.RespError("Only team super admin can do this"))
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

	// must transfer to a team user
	_, err = models.QueryTeamMember(c.Request.Context(), teamId, transferToUser.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(400, common.RespError("the user which you want to transfer to is not in team"))
			return
		}
		logger.Warn("query team user error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	// transfer
	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("transfer team error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer tx.Rollback()

	now := time.Now()
	// set target user to super admin
	_, err = tx.ExecContext(c.Request.Context(), "UPDATE team_member SET role=?,updated=? WHERE team_id=? AND user_id=?", models.ROLE_SUPER_ADMIN, now, teamId, transferToUser.Id)
	if err != nil {
		logger.Warn("transfer team error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	//set self to admin
	_, err = tx.ExecContext(c.Request.Context(), "UPDATE team_member SET role=?,updated=? WHERE team_id=? AND user_id=?", models.ROLE_ADMIN, now, teamId, u.Id)
	if err != nil {
		logger.Warn("transfer team error", "error", err)
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
