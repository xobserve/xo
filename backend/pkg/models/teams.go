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
package models

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/DataObserve/datav/backend/pkg/db"
)

// dont change !
const (
	GlobalTeamId   = 1
	GlobalTeamName = "global"
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
	AllowGlobal     bool      `json:"allowGlobal"` // allow using global team resources
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
	err := db.Conn.QueryRow(`SELECT id,name,is_public,allow_global,created_by,created,updated FROM team WHERE id=? or name=?`,
		id, name).Scan(&team.Id, &team.Name, &team.IsPublic, &team.AllowGlobal, &team.CreatedById, &team.Created, &team.Updated)
	if err != nil {
		return nil, err
	}

	return team, nil
}

func QueryTeamNameById(id int64) (string, error) {
	var name string
	err := db.Conn.QueryRow(`SELECT name FROM team WHERE id=?`,
		id).Scan(&name)
	if err != nil {
		return "", err
	}

	return name, nil
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

func QueryVisibleTeamsByUserId(userId int64) ([]int64, error) {
	membersMap := make(map[int64]bool)
	rows, err := db.Conn.Query("SELECT team_id from team_member WHERE user_id=?", userId)
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

	rows, err = db.Conn.Query("SELECT id from team WHERE is_public=?", true)
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

	members := make([]int64, len(membersMap))
	for v := range membersMap {
		members = append(members, v)
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

func QuerySideMenu(id int64, teamId int64) (*SideMenu, error) {
	menu := &SideMenu{}
	var rawJson []byte
	err := db.Conn.QueryRow("SELECT team_id,is_public,brief,data from sidemenu WHERE id=? or team_id=?", id, teamId).Scan(&menu.TeamId, &menu.IsPublic, &menu.Brief, &rawJson)
	if err != nil {
		return nil, err
	}

	json.Unmarshal(rawJson, &menu.Data)
	return menu, nil
}

func IsTeamPublic(id int64) (bool, error) {
	var isPublic bool
	err := db.Conn.QueryRow("SELECT is_public from team WHERE id=?", id).Scan(&isPublic)
	if err != nil {
		return false, err
	}

	return isPublic, nil
}

func IsTeamVisibleToUser(teamId int64, userId int64) (bool, error) {
	if teamId == GlobalTeamId {
		return true, nil
	}

	isPublic, err := IsTeamPublic(teamId)
	if err != nil {
		return false, err
	}

	if isPublic {
		return true, nil
	}

	member, err := QueryTeamMember(teamId, userId)
	if err != nil {
		return false, err
	}

	if member.Id != 0 {
		return true, nil
	}

	return false, nil
}
