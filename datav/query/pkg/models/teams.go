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
package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	storageData "github.com/xobserve/xo/query/internal/storage/data"
	"github.com/xobserve/xo/query/pkg/common"
	"github.com/xobserve/xo/query/pkg/db"
	"github.com/xobserve/xo/query/pkg/e"
)

// dont change !
const (
	DefaultTeamId   = 1
	DefaultTeamName = "default"
)

type Team struct {
	Id              int64     `json:"id"`
	Name            string    `json:"name"`
	IsPublic        bool      `json:"isPublic,omitempty"`
	Brief           string    `json:"brief,omitempty"`
	CreatedBy       string    `json:"createdBy,omitempty"`   // creator's username
	CreatedById     int64     `json:"createdById,omitempty"` // creator's username
	Created         time.Time `json:"created,omitempty"`
	Updated         time.Time `json:"updated,omitempty"`
	MemberCount     int       `json:"memberCount,omitempty"`
	CurrentUserRole RoleType  `json:"role,omitempty"`
	TenantId        int64     `json:"tenantId,omitempty"`
	Status          int       `json:"status,omitempty"`    // 0: normal, 1: deleted
	SyncUsers       bool      `json:"syncUsers,omitempty"` // sync users from tenant
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
	err := db.Conn.QueryRowContext(ctx, `SELECT id,name,created_by,tenant_id,status,sync_users,created,updated FROM team WHERE id=? or name=?`,
		id, name).Scan(&team.Id, &team.Name, &team.CreatedById, &team.TenantId, &team.Status, &team.SyncUsers, &team.Created, &team.Updated)
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
	TeamId   int64         `json:"teamId"`
	TeamName string        `json:"teamName"`
	Brief    string        `json:"brief"`
	Data     [][]*MenuItem `json:"data"`
}

type MenuItem struct {
	Url         string         `json:"url"`
	Title       string         `json:"title"`
	DashboardId string         `json:"dashboardId"`
	Icon        string         `json:"icon,omitempty"`
	Children    []*SubMenuItem `json:"children"`
	TemplateId  int64          `json:"templateId"`
}

type SubMenuItem struct {
	Url         string `json:"url"`
	Title       string `json:"title"`
	DashboardId string `json:"dashboardId"`
	TemplateId  int64  `json:"templateId"`
}

func QuerySideMenu(ctx context.Context, id int64, tx *sql.Tx) (*SideMenu, error) {
	menu := &SideMenu{
		TeamId: id,
	}
	var rawJson []byte
	var err error
	if tx != nil {
		err = tx.QueryRowContext(ctx, "SELECT sidemenu from team WHERE id=?", id).Scan(&rawJson)

	} else {
		err = db.Conn.QueryRowContext(ctx, "SELECT sidemenu from team WHERE id=?", id).Scan(&rawJson)
	}
	if err != nil {
		return nil, err
	}

	json.Unmarshal(rawJson, &menu.Data)
	return menu, nil
}

func IsTeamVisibleToUser(ctx context.Context, teamId int64, userId int64) (bool, error) {
	_, err := QueryTeamMember(ctx, teamId, userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	return true, nil

}

func IsTeamDeleted(ctx context.Context, teamId int64) (bool, error) {
	var status int
	err := db.Conn.QueryRowContext(ctx, "SELECT status from team WHERE id=?", teamId).Scan(&status)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, errors.New("team not found")
		}
		return false, err
	}

	if status == common.StatusDeleted {
		return true, nil
	}

	return false, nil

}

func CreateTeam(ctx context.Context, tx *sql.Tx, tenantId int64, userId int64, name string, brief string) (int64, error) {
	now := time.Now()
	res, err := tx.ExecContext(ctx, "INSERT INTO team (tenant_id,name,brief,created_by,created,updated) VALUES (?,?,?,?,?,?)",
		tenantId, name, brief, userId, now, now)
	if err != nil {
		return 0, err
	}

	id, _ := res.LastInsertId()

	// insert self as first team member
	_, err = tx.ExecContext(ctx, "INSERT INTO team_member (tenant_id,team_id,user_id,role,created,updated) VALUES (?,?,?,?,?,?)", tenantId, id, userId, ROLE_SUPER_ADMIN, now, now)
	if err != nil {
		return 0, err
	}

	// create testdata datasource
	_, err = tx.ExecContext(ctx, `INSERT INTO datasource (id,name,type,url,team_id,created,updated) VALUES (?,?,?,?,?,?,?)`,
		1, "TestData", DatasourceTestData, "", id, now, now)
	if err != nil {
		return 0, err
	}

	// create dashboards from template
	tenantTemplates, err := QueryTenantUseTemplates(tenantId)
	if err != nil {
		return 0, fmt.Errorf("query tenant use templates error: %w", err)
	}
	websiteTemplaes, err := QueryWebsiteUseTemplates()
	if err != nil {
		return 0, fmt.Errorf("query website use templates error: %w", err)
	}
	useTemplateIds := append(tenantTemplates, websiteTemplaes...)
	for _, templateId := range useTemplateIds {
		// get template export
		contentId, err := QueryContentIdTemplateId(ctx, templateId)
		if err != nil {
			return 0, fmt.Errorf("query template content id error: %w", err)
		}
		if contentId == 0 {
			continue
		}

		export, err := QueryTemplateExportByTemplateId(ctx, contentId)
		if err != nil {
			return 0, fmt.Errorf("query template export error: %w", err)
		}

		if export != nil {
			err = CreateResourcesByTemplateExport(ctx, templateId, export, common.ScopeTeam, id, userId, tx)
			if err != nil {
				if !e.IsErrUniqueConstraint(err) {
					return 0, fmt.Errorf("create dashboard by template export error: %w", err)
				}
			}
		}
	}

	dashCount := 0
	err = tx.QueryRow("SELECT count(*) FROM dashboard WHERE team_id=?", id).Scan(&dashCount)
	if err != nil {
		return 0, fmt.Errorf("query dashboard count error: %w", err)
	}

	if dashCount == 0 {
		// insert home dashboard
		d, err := ImportDashboardFromJSON(tx, storageData.HomeDashboard, id, userId)
		if err != nil && !e.IsErrUniqueConstraint(err) {
			return 0, fmt.Errorf("init home dashboard error: %w", err)
		}

		// init sidemenu
		initSidemenu := []*MenuItem{
			{
				Title:       "Home",
				Url:         "/home",
				Icon:        "FaHome",
				DashboardId: d.Id,
			},
		}

		err = UpdateSideMenu(ctx, id, [][]*MenuItem{
			initSidemenu,
		}, tx)
		if err != nil {
			return 0, fmt.Errorf("update team sidemenu error: %w", err)
		}
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
	rows, err := db.Conn.QueryContext(ctx, "SELECT team_member.team_id, team.name FROM team_member INNER JOIN team ON team_member.team_id=team.id WHERE team_member.user_id=? and team_member.tenant_id=? and team.status!=? ORDER BY team_member.team_id", userId, tenantId, common.StatusDeleted)
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

func DeleteTeam(ctx context.Context, teamId int64, tx *sql.Tx) error {
	// delete team variables
	_, err := tx.ExecContext(ctx, "DELETE FROM variable WHERE team_id=?", teamId)
	if err != nil {
		return errors.New("delete team variables error:" + err.Error())
	}

	// delete team dashboards
	dashIds := make([]string, 0)
	rows, err := tx.QueryContext(ctx, "SELECT id FROM dashboard WHERE team_id=?", teamId)
	if err != nil {
		return errors.New("query team dashboards error:" + err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		var id string
		err := rows.Scan(&id)
		if err != nil {
			return errors.New("scan team dashboards error:" + err.Error())
		}
		dashIds = append(dashIds, id)
	}
	for _, id := range dashIds {
		err = DeleteDashboard(ctx, teamId, id, tx)
		if err != nil {
			return errors.New("delete team dashboard error:" + err.Error())
		}
	}
	_, err = tx.ExecContext(ctx, "DELETE FROM dashboard WHERE team_id=?", teamId)
	if err != nil {
		return errors.New("delete team dashboards error:" + err.Error())
	}

	// delete team datasources
	_, err = tx.ExecContext(ctx, "DELETE FROM datasource WHERE team_id=?", teamId)
	if err != nil {
		return errors.New("delete team datasources error:" + err.Error())
	}

	// delete team members
	_, err = tx.ExecContext(ctx, "DELETE FROM team_member WHERE team_id=?", teamId)
	if err != nil {
		return errors.New("delete team member error:" + err.Error())
	}

	//delete team
	_, err = tx.ExecContext(ctx, "DELETE FROM team WHERE id=?", teamId)
	if err != nil {
		return errors.New("delete team error:" + err.Error())
	}

	return nil
}

func CreateSidemenuInScope(ctx context.Context, templateId int64, scopeType int, scopeId int64, v []*MenuItem, tx *sql.Tx) error {
	if scopeType == common.ScopeTeam {
		return ImportSidemenu(ctx, templateId, scopeId, v, tx, true)
	}

	if scopeType == common.ScopeTenant {
		return CreateSideMenuInTenant(ctx, templateId, scopeId, v, tx)
	}

	// scope website
	tenants, err := QueryAllTenantIds(ctx)
	if err != nil {
		return err
	}

	for _, tenantId := range tenants {
		err = CreateSideMenuInTenant(ctx, templateId, tenantId, v, tx)
		if err != nil {
			return err
		}
	}

	return nil
}

func CreateSideMenuInTenant(ctx context.Context, templateId int64, tenantId int64, v []*MenuItem, tx *sql.Tx) error {
	teamIds, err := QueryTenantAllTeamIds(tenantId)
	if err != nil {
		return err
	}

	for _, teamId := range teamIds {
		err = ImportSidemenu(ctx, templateId, teamId, v, tx, true)
		if err != nil && !e.IsErrUniqueConstraint(err) {
			return err
		}
	}

	return nil
}

func UpdateSideMenu(ctx context.Context, teamId int64, menu [][]*MenuItem, tx *sql.Tx) error {
	data, err := json.Marshal(menu)
	if err != nil {
		return err
	}
	_, err = tx.ExecContext(ctx, "UPDATE team SET sidemenu=?,updated=? WHERE id=?", data, time.Now(), teamId)
	if err != nil {
		return err
	}

	return nil

}
