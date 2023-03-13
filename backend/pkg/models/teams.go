package models

import (
	"database/sql"
	"time"

	"github.com/ai-apm/aiapm/backend/pkg/db"
)

// dont change !
const (
	GlobalTeamId   = 1
	GlobalTeamName = "global"
)

type Team struct {
	Id          int64     `json:"id"`
	Name        string    `json:"name"`
	Brief       string    `json:"brief"`
	CreatedBy   string    `json:"createdBy,omitempty"`   // creator's username
	CreatedById int64     `json:"createdById,omitempty"` // creator's username
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
}

type TeamMembers []*TeamMember

func (s TeamMembers) Len() int      { return len(s) }
func (s TeamMembers) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s TeamMembers) Less(i, j int) bool {
	return s[i].RoleSortWeight > s[j].RoleSortWeight
}

func QueryTeam(id int64, name string) (*Team, error) {
	team := &Team{}
	err := db.Conn.QueryRow(`SELECT id,name,created_by FROM team WHERE id=? or name=?`,
		id, name).Scan(&team.Id, &team.Name, &team.CreatedById)
	if err != nil {
		return nil, err
	}

	return team, nil
}

func IsTeamExist(id int64, name string) bool {
	var qid int64
	err := db.Conn.QueryRow(`SELECT id FROM team WHERE id=? or name=?`,
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
	err := db.Conn.QueryRow(`SELECT role FROM team_member WHERE team_id=? and user_id=?`,
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

func QueryTeamMembersByUserId(userId int64) ([]*TeamMember, error) {
	members := make([]*TeamMember, 0)
	rows, err := db.Conn.Query("SELECT team_id,role from team_member WHERE user_id=?", userId)
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

func IsTeamAdmin(teamId, userId int64) (bool, error) {
	teamMember, err := QueryTeamMember(teamId, userId)
	if err != nil {
		return false, err
	}

	if teamMember.Role.IsAdmin() {
		return true, nil
	}

	return false, nil
}

const (
	DefaultMenuId    = 1
	DefaultMenuBrief = "default side menu"
)

type SideMenu struct {
	TeamId   int64       `json:"teamId"`
	IsPublic bool        `json:"isPublic"`
	TeamName string      `json:"teamName"`
	Brief    string      `json:"brief"`
	Data     interface{} `json:"data"`
}
