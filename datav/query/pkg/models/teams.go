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
package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/xObserve/xObserve/query/pkg/db"
)

// dont change !
const (
	DefaultTeamId   = 1
	DefaultTeamName = "default"
)

var InitTeamMenu = []map[string]interface{}{
	{
		"title":       "Home",
		"url":         "/home",
		"icon":        "FaHome",
		"dashboardId": HomeDashboardId,
	},
}

type Team struct {
	Id              int64     `json:"id"`
	Name            string    `json:"name"`
	IsPublic        bool      `json:"isPublic"`
	Brief           string    `json:"brief"`
	CreatedBy       string    `json:"createdBy,omitempty"`   // creator's username
	CreatedById     int64     `json:"createdById,omitempty"` // creator's username
	Created         time.Time `json:"created,omitempty"`
	Updated         time.Time `json:"updated,omitempty"`
	MemberCount     int       `json:"memberCount,omitempty"`
	CurrentUserRole RoleType  `json:"role,omitempty"`
	TenantId        int64     `json:"tenantId,omitempty"`
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

func QueryTeam(ctx context.Context, id int64, name string) (*Team, error) {
	team := &Team{}
	err := db.Conn.QueryRowContext(ctx, `SELECT id,name,is_public,created_by,tenant_id,created,updated FROM team WHERE id=? or name=?`,
		id, name).Scan(&team.Id, &team.Name, &team.IsPublic, &team.CreatedById, &team.TenantId, &team.Created, &team.Updated)
	if err != nil {
		return nil, err
	}

	return team, nil
}

func QueryTeamNameById(ctx context.Context, id int64) (string, error) {
	var name string
	err := db.Conn.QueryRowContext(ctx, `SELECT name FROM team WHERE id=?`,
		id).Scan(&name)
	if err != nil {
		return "", err
	}

	return name, nil
}

func IsTeamExist(ctx context.Context, id int64) bool {
	var qid int64
	err := db.Conn.QueryRowContext(ctx, `SELECT id FROM team WHERE id=?`, id).Scan(&qid)
	if err != nil {
		return false
	}

	if qid == id {
		return true
	}

	return false
}

func QueryTeamMember(ctx context.Context, teamId int64, userId int64) (*TeamMember, error) {
	member := &TeamMember{}
	member.Role = ROLE_VIEWER
	err := db.Conn.QueryRowContext(ctx, `SELECT role FROM team_member WHERE team_id=? and user_id=?`,
		teamId, userId).Scan(&member.Role)
	if err != nil {
		return nil, err
	}

	member.Id = userId
	member.TeamId = teamId

	return member, nil
}

func QueryVisibleTeamsByUserId(ctx context.Context, tenantId int64, userId int64) ([]int64, error) {
	membersMap := make(map[int64]bool)
	rows, err := db.Conn.QueryContext(ctx, "SELECT team_id from team_member WHERE tenant_id = ? and user_id=?", tenantId, userId)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var m int64
		err := rows.Scan(&m)
		if err != nil {
			return nil, err
		}

		membersMap[m] = true
	}

	rows, err = db.Conn.QueryContext(ctx, "SELECT id from team WHERE tenant_id = ? and is_public=?", tenantId, true)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var m int64
		err := rows.Scan(&m)
		if err != nil {
			return nil, err
		}

		membersMap[m] = true
	}

	members := make([]int64, 0, len(membersMap))
	for v := range membersMap {
		members = append(members, v)
	}

	return members, nil
}

func IsTeamAdmin(ctx context.Context, teamId, userId int64) (bool, error) {
	teamMember, err := QueryTeamMember(ctx, teamId, userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, errors.New("not team member")
		}
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
	TeamName string      `json:"teamName"`
	Brief    string      `json:"brief"`
	Data     []*MenuItem `json:"data"`
}

type MenuItem struct {
	Url         string      `json:"url"`
	Title       string      `json:"title"`
	DashboardId string      `json:"dashboardId"`
	Icon        string      `json:"icon,omitempty"`
	Children    interface{} `json:"children"`
}

func QuerySideMenu(ctx context.Context, id int64) (*SideMenu, error) {
	menu := &SideMenu{
		TeamId: id,
	}
	var rawJson []byte
	err := db.Conn.QueryRowContext(ctx, "SELECT sidemenu from team WHERE id=?", id).Scan(&rawJson)
	if err != nil {
		return nil, err
	}

	json.Unmarshal(rawJson, &menu.Data)
	return menu, nil
}

func IsTeamPublic(ctx context.Context, id int64) (bool, error) {
	var isPublic bool
	err := db.Conn.QueryRowContext(ctx, "SELECT is_public from team WHERE id=?", id).Scan(&isPublic)
	if err != nil {
		return false, err
	}

	return isPublic, nil
}

func IsTeamVisibleToUser(ctx context.Context, teamId int64, userId int64) (bool, error) {
	isPublic, err := IsTeamPublic(ctx, teamId)
	if err != nil {
		return false, err
	}

	if isPublic {
		return true, nil
	}

	_, err = QueryTeamMember(ctx, teamId, userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	return true, nil

}

func CreateTeam(ctx context.Context, tx *sql.Tx, u *User, name string, brief string) (int64, error) {
	now := time.Now()

	sidemenu, _ := json.Marshal([]map[string]interface{}{})

	res, err := tx.ExecContext(ctx, "INSERT INTO team (tenant_id,name,brief,created_by,sidemenu,created,updated) VALUES (?,?,?,?,?,?,?)",
		u.CurrentTenant, name, brief, u.Id, sidemenu, now, now)
	if err != nil {
		return 0, err
	}

	id, _ := res.LastInsertId()

	// insert self as first team member
	_, err = tx.ExecContext(ctx, "INSERT INTO team_member (tenant_id,team_id,user_id,role,created,updated) VALUES (?,?,?,?,?,?)", u.CurrentTenant, id, u.Id, ROLE_SUPER_ADMIN, now, now)
	if err != nil {
		return 0, err
	}

	// create testdata datasource
	_, err = tx.Exec(`INSERT INTO datasource (name,type,url,team_id,created,updated) VALUES (?,?,?,?,?,?)`,
		"TestData", DatasourceTestData, "", id, now, now)
	if err != nil {
		return 0, err
	}

	return id, nil
}

func QueryTeamsUserIn(ctx context.Context, userId int64) ([]int64, error) {
	members := make([]int64, 0)
	rows, err := db.Conn.QueryContext(ctx, "SELECT team_id from team_member WHERE user_id=? ORDER BY team_id", userId)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var m int64
		err := rows.Scan(&m)
		if err != nil {
			return nil, err
		}

		members = append(members, m)
	}

	return members, nil
}

func QueryTeamsUserInTenant(ctx context.Context, tenantId, userId int64) ([]*Team, error) {
	teams := make([]*Team, 0)
	rows, err := db.Conn.QueryContext(ctx, "SELECT team_member.team_id, team.name from team_member INNER JOIN team ON team_member.team_id=team.id WHERE team_member.user_id=? and team_member.tenant_id=? ORDER BY team_member.team_id", userId, tenantId)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		team := &Team{}
		err := rows.Scan(&team.Id, &team.Name)
		if err != nil {
			return nil, err
		}

		teams = append(teams, team)
	}

	return teams, nil
}
