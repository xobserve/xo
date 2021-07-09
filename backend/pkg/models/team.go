package models

import (
	"database/sql"
	"time"

	"errors"

	"github.com/datav-io/datav/backend/pkg/db"
)

// dont change !
const (
	GlobalTeamId   = 1
	GlobalTeamName = "global"
)

// team permissions
const (
	CanView            = 1
	CanAdd             = 2
	CanEdit            = 3
	CanSave            = 4
	CanDelete          = 5
	CanMangePermission = 6
)

type Team struct {
	Id          int64     `json:"id"`
	Name        string    `json:"name"`
	CreatedBy   string    `json:"createdBy"`   // creator's username
	CreatedById int64     `json:"createdById"` // creator's username
	Created     time.Time `json:"created,omitempty"`
	Updated     time.Time `json:"updated,omitempty"`
	MemberCount int       `json:"memberCount,omitempty"`
}

type Teams []*Team

func (s Teams) Len() int      { return len(s) }
func (s Teams) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s Teams) Less(i, j int) bool {
	return s[i].MemberCount > s[j].MemberCount
}

type TeamMember struct {
	Id             int64     `json:"id"`
	TeamId         int64     `json:"teamId,omitempty"`
	Username       string    `json:"username"`
	Created        time.Time `json:"created"`
	Role           RoleType  `json:"role"`
	RoleSortWeight int       `json:"-"`
	CreatedAge     string    `json:"createdAge"`
}

type TeamMembers []*TeamMember

func (s TeamMembers) Len() int      { return len(s) }
func (s TeamMembers) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s TeamMembers) Less(i, j int) bool {
	return s[i].RoleSortWeight > s[j].RoleSortWeight
}

func QueryTeam(id int64, name string) (*Team, error) {
	team := &Team{}
	err := db.SQL.QueryRow(`SELECT id,name,created_by FROM team WHERE id=? or name=?`,
		id, name).Scan(&team.Id, &team.Name, &team.CreatedById)
	if err != nil {
		return nil, err
	}

	return team, nil
}

func IsTeamExist(id int64, name string) bool {
	var qid int64
	err := db.SQL.QueryRow(`SELECT id FROM team WHERE id=? or name=?`,
		id, name).Scan(&qid)
	if err != nil {
		return false
	}

	if qid == id {
		return true
	}

	return false
}

func QueryTeamMember(teamId int64, userId int64) (*TeamMember, error) {
	member := &TeamMember{}
	member.Role = ROLE_VIEWER
	err := db.SQL.QueryRow(`SELECT role FROM team_member WHERE team_id=? and user_id=?`,
		teamId, userId).Scan(&member.Role)
	if err != nil && err != sql.ErrNoRows {
		return member, err
	}

	if err == sql.ErrNoRows {
		return member, nil
	}

	member.Id = userId
	member.TeamId = teamId

	return member, nil
}

var minPermission = map[RoleType][]int{
	ROLE_ADMIN:  []int{CanView, CanAdd, CanEdit, CanSave, CanDelete, CanMangePermission},
	ROLE_EDITOR: []int{CanView, CanAdd, CanEdit, CanSave},
	ROLE_VIEWER: []int{CanView},
}

func QueryTeamPermissions(teamId int64) (map[RoleType][]int, error) {
	permissions := make(map[RoleType][]int)
	permissions[ROLE_ADMIN] = make([]int, 0)
	permissions[ROLE_EDITOR] = make([]int, 0)
	permissions[ROLE_VIEWER] = make([]int, 0)

	rows, err := db.SQL.Query("SELECT role,permission FROM team_acl WHERE team_id=?", teamId)
	if err != nil && err != sql.ErrNoRows {
		return minPermission, err
	}

	if err == sql.ErrNoRows {
		return minPermission, errors.New("Bad data happend, this team has no permission rules")
	}

	for rows.Next() {
		var role RoleType
		var permission int
		err := rows.Scan(&role, &permission)
		if err != nil {
			return minPermission, err
		}

		ps := permissions[role]
		ps = append(ps, permission)
		permissions[role] = ps
	}

	return permissions, nil
}

func QueryTeamRolePermission(teamId int64, role RoleType) ([]int, error) {
	permission := make([]int, 0)

	rows, err := db.SQL.Query("SELECT permission FROM team_acl WHERE team_id=? and role=?", teamId, role)
	if err != nil && err != sql.ErrNoRows {
		return minPermission[role], err
	}

	if err == sql.ErrNoRows {
		return minPermission[role], errors.New("Bad data happend, this team has no permission rules")
	}

	for rows.Next() {
		var ps int
		err := rows.Scan(&ps)
		if err != nil {
			return minPermission[role], err
		}

		permission = append(permission, ps)
	}

	return permission, nil
}

func TeamRoleHasPermission(teamId int64, role RoleType, permission int) (bool, error) {
	var id int64
	err := db.SQL.QueryRow("SELECT id FROM team_acl WHERE team_id=? and role=? and permission=?",
		teamId, role, permission).Scan(&id)
	if err != nil && err != sql.ErrNoRows {
		return isInminPermission(role, permission), err
	}

	if err == sql.ErrNoRows {
		return isInminPermission(role, permission), nil
	}

	if id == 0 {
		return false, nil
	}

	return true, nil
}

func QueryTeamMembersByUserId(userId int64) ([]*TeamMember, error) {
	members := make([]*TeamMember, 0)
	rows, err := db.SQL.Query("SELECT team_id,role from team_member WHERE user_id=?", userId)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	for rows.Next() {
		m := &TeamMember{}
		err := rows.Scan(&m.TeamId, &m.Role)
		if err != nil {
			return nil, err
		}

		members = append(members, m)
	}

	return members, nil
}

func isInminPermission(role RoleType, permission int) bool {
	permissions := minPermission[role]
	for _, p := range permissions {
		if p == permission {
			return true
		}
	}

	return false
}
