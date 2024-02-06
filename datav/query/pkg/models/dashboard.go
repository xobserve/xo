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
	"fmt"
	"time"

	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/utils/simplejson"
)

const DashboardIdPrefix = "d-"

const (
	TeamVisible   = "team"
	TenantVisible = "tenant"
	AllVisible    = "all"
)

type Dashboard struct {
	Id       string `json:"id"`
	Title    string `json:"title"`
	Editable bool   `json:"editable,omitempty"`

	Created *time.Time `json:"created,omitempty"`
	Updated *time.Time `json:"updated,omitempty"`

	CreatedBy int64            `json:"createdBy,omitempty"`
	OwnedBy   int64            `json:"ownedBy,omitempty"` // team that ownes this dashboard
	OwnerName string           `json:"ownerName,omitempty"`
	VisibleTo string           `json:"visibleTo"`
	Tags      []string         `json:"tags,omitempty"`
	Data      *simplejson.Json `json:"data,omitempty"`

	TemplateId int64 `json:"templateId"`

	SortWeight int         `json:"weight"`
	Variables  []*Variable `json:"variables,omitempty"`

	Links []*ExternalLink `json:"links"`
}

type ExternalLink struct {
	Title       string `json:"title"`
	Url         string `json:"url"`
	TargetBlank bool   `json:"targetBlank"`
	Icon        string `json:"icon"`
}

const queryDashboardBase = "SELECT id,title,tags,data,team_id,visible_to,weight,updated,editable,template_id,links FROM dashboard"

func QueryDashboard(ctx context.Context, teamId int64, id string) (*Dashboard, error) {
	dash := &Dashboard{}

	var rawJSON []byte
	var rawTags []byte
	var rawLinks []byte
	err := db.Conn.QueryRowContext(ctx, queryDashboardBase+" WHERE team_id=? and id = ?", teamId, id).Scan(&dash.Id, &dash.Title, &rawTags, &rawJSON, &dash.OwnedBy, &dash.VisibleTo, &dash.SortWeight, &dash.Updated, &dash.Editable, &dash.TemplateId, &rawLinks)
	if err != nil {
		return nil, err
	}

	err = initDashboard(ctx, dash, rawTags, rawJSON, rawLinks)
	if err != nil {
		return nil, err
	}

	teamName, _ := QueryTeamNameById(ctx, dash.OwnedBy)
	if teamName == "" {
		teamName = "not_found"
	}
	dash.OwnerName = teamName

	return dash, nil
}

func initDashboard(ctx context.Context, dash *Dashboard, rawTags []byte, rawJSON []byte, rawLinks []byte) error {
	data := simplejson.New()
	err := data.UnmarshalJSON(rawJSON)
	if err != nil {
		return err
	}
	dash.Data = data

	tags := make([]string, 0)
	err = json.Unmarshal(rawTags, &tags)
	if err != nil {
		return err
	}
	dash.Tags = tags

	links := make([]*ExternalLink, 0)
	err = json.Unmarshal(rawLinks, &links)
	if err != nil {
		return err
	}
	dash.Links = links

	return nil
}

func QuertyDashboardStared(ctx context.Context, userId int64, teamId int64, dashId string) (bool, error) {
	var count int
	err := db.Conn.QueryRowContext(ctx, "SELECT count(1) FROM star_dashboard WHERE user_id=? and team_id=? and dashboard_id=?", userId, teamId, dashId).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func QueryDashboardsByTeamId(ctx context.Context, teamId int64) ([]*Dashboard, error) {
	dashboards := make([]*Dashboard, 0)
	rows, err := db.Conn.QueryContext(ctx, queryDashboardBase+` WHERE team_id=?`, teamId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		dash := &Dashboard{}
		var rawJSON []byte
		var rawTags []byte
		var rawLinks []byte
		err := rows.Scan(&dash.Id, &dash.Title, &rawTags, &rawJSON, &dash.OwnedBy, &dash.VisibleTo, &dash.SortWeight, &dash.Updated, &dash.Editable, &dash.TemplateId, &rawLinks)
		if err != nil {
			return nil, err
		}

		err = initDashboard(ctx, dash, rawTags, rawJSON, rawLinks)
		if err != nil {
			return nil, err
		}

		dashboards = append(dashboards, dash)
	}

	return dashboards, nil
}

func IsDashboardExist(ctx context.Context, teamId int64, id string) error {
	var tid int64
	err := db.Conn.QueryRowContext(ctx, "SELECT team_id FROM dashboard WHERE team_id=? and id = ?", teamId, id).Scan(&tid)
	if err != nil {
		return err
	}

	return nil
}

func DeleteDashboard(ctx context.Context, teamId int64, id string, tx *sql.Tx) error {
	_, err := tx.ExecContext(ctx, "DELETE FROM dashboard WHERE team_id=? and id=?", teamId, id)
	if err != nil {
		return fmt.Errorf("delete dashboard error: %w", err)
	}

	_, err = tx.ExecContext(ctx, "DELETE FROM temp_dashboard WHERE team_id=? and id=?", teamId, id)
	if err != nil {
		return fmt.Errorf("delete temp dashboard error: %w", err)
	}

	_, err = tx.ExecContext(ctx, "DELETE FROM star_dashboard WHERE team_id=? and dashboard_id=?", teamId, id)
	if err != nil {
		return fmt.Errorf("delete dashboard star error: %w", err)
	}

	_, err = tx.ExecContext(ctx, "DELETE FROM dashboard_history WHERE team_id=? and dashboard_id=?", teamId, id)
	if err != nil {
		return fmt.Errorf("delete dashboard history error: %w", err)
	}

	_, err = tx.ExecContext(ctx, "DELETE FROM annotation WHERE team_id=? and namespace_id=?", teamId, id)
	if err != nil {
		return fmt.Errorf("delete dashboard annotations error: %w", err)
	}

	return nil
}

func CreateDashboardInScope(ctx context.Context, scopeType int, scopeId int64, userId int64, dash *Dashboard, tx *sql.Tx) error {
	if scopeType == common.ScopeTeam {
		return ImportDashboard(tx, dash, scopeId, userId, true)
	}

	if scopeType == common.ScopeTenant {
		return CreateDashboardInTenant(scopeId, userId, dash, tx)
	}

	// scope website
	tenants, err := QueryAllTenantIds(ctx)
	if err != nil {
		return err
	}

	for _, tenantId := range tenants {
		err = CreateDashboardInTenant(tenantId, userId, dash, tx)
		if err != nil {
			return err
		}
	}

	return nil
}

func CreateDashboardInTenant(tenantId int64, userId int64, dash *Dashboard, tx *sql.Tx) error {
	teamIds, err := QueryTenantAllTeamIds(tenantId)
	if err != nil {
		return err
	}

	for _, teamId := range teamIds {
		err = ImportDashboard(tx, dash, teamId, userId, true)
		if err != nil && !e.IsErrUniqueConstraint(err) {
			return err
		}
	}

	return nil
}

func RemoveDashboardsInScope(ctx context.Context, dashId string, scopeType int, scopeId int64, tx *sql.Tx) error {
	if scopeType == common.ScopeTeam {
		return DeleteDashboard(ctx, scopeId, dashId, tx)
	}

	if scopeType == common.ScopeTenant {
		return DeleteDashboardInTenant(ctx, scopeId, dashId, tx)
	}

	// scope website
	tenants, err := QueryAllTenantIds(ctx)
	if err != nil {
		return err
	}

	for _, tenantId := range tenants {
		err = DeleteDashboardInTenant(ctx, tenantId, dashId, tx)
		if err != nil {
			return err
		}
	}

	return nil
}

func DeleteDashboardInTenant(ctx context.Context, tenantId int64, dashId string, tx *sql.Tx) error {
	teamIds, err := QueryTenantAllTeamIds(tenantId)
	if err != nil {
		return err
	}

	for _, teamId := range teamIds {
		err = DeleteDashboard(ctx, teamId, dashId, tx)
		if err != nil {
			return err
		}
	}

	return nil
}
