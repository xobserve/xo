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

	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/utils"
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

	SortWeight int         `json:"weight"`
	Variables  []*Variable `json:"variables,omitempty"`
}

func QueryDashboard(ctx context.Context, id string) (*Dashboard, error) {
	dash := &Dashboard{}

	var rawJSON []byte
	var rawTags []byte
	err := db.Conn.QueryRowContext(ctx, "SELECT title,tags,data,team_id,visible_to,weight,updated FROM dashboard WHERE id = ?", id).Scan(&dash.Title, &rawTags, &rawJSON, &dash.OwnedBy, &dash.VisibleTo, &dash.SortWeight, &dash.Updated)
	if err != nil {
		return nil, err
	}

	data := simplejson.New()
	err = data.UnmarshalJSON(rawJSON)
	if err != nil {
		return nil, err
	}
	dash.Data = data

	tags := make([]string, 0)
	err = json.Unmarshal(rawTags, &tags)
	if err != nil {
		return nil, err
	}
	dash.Tags = tags

	teamName, _ := QueryTeamNameById(ctx, dash.OwnedBy)
	if teamName == "" {
		teamName = "not_found"
	}
	dash.OwnerName = teamName

	dash.Editable = true

	dash.Id = id
	return dash, nil
}

func QuertyDashboardStared(ctx context.Context, uid int64, dashId string) (bool, error) {
	var count int
	err := db.Conn.QueryRowContext(ctx, "SELECT count(1) FROM star_dashboard WHERE user_id=? and dashboard_id=?", uid, dashId).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func QueryDashboardsByTeamId(ctx context.Context, teamId int64) ([]*Dashboard, error) {
	dashboards := make([]*Dashboard, 0)
	rows, err := db.Conn.QueryContext(ctx, `SELECT id FROM dashboard WHERE team_id=?`, teamId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		dash := &Dashboard{OwnedBy: teamId}
		err := rows.Scan(&dash.Id)
		if err != nil {
			return nil, err
		}

		dashboards = append(dashboards, dash)
	}

	return dashboards, nil
}

func QueryDashboardBelongsTo(ctx context.Context, id string) (int64, error) {
	var teamId int64
	err := db.Conn.QueryRowContext(ctx, "SELECT team_id FROM dashboard WHERE id = ?", id).Scan(&teamId)
	if err != nil {
		return 0, err
	}

	return teamId, nil
}

func ImportFromJSON(tx *sql.Tx, raw string, teamId int64, userId int64) (*Dashboard, error) {
	var dash *Dashboard
	err := json.Unmarshal([]byte(raw), &dash)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	if dash.Id == "" {
		dash.Id = "d-" + utils.GenerateShortUID()
	}

	dash.Created = &now
	dash.Updated = &now

	jsonData, err := dash.Data.Encode()
	if err != nil {
		return nil, err
	}

	tags, err := json.Marshal(dash.Tags)
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(`INSERT INTO dashboard (id,title, team_id, created_by,tags, data,created,updated) VALUES (?,?,?,?,?,?,?,?)`,
		dash.Id, dash.Title, teamId, userId, tags, jsonData, dash.Created, dash.Updated)
	if err != nil {
		return nil, err
	}

	return dash, nil
}

func DeleteDashboard(ctx context.Context, id string, tx *sql.Tx) error {
	_, err := tx.ExecContext(ctx, "DELETE FROM dashboard WHERE id=?", id)
	if err != nil {
		return fmt.Errorf("delete dashboard error: %w", err)
	}

	_, err = tx.ExecContext(ctx, "DELETE FROM star_dashboard WHERE dashboard_id=?", id)
	if err != nil {
		return fmt.Errorf("delete dashboard star error: %w", err)
	}

	_, err = tx.ExecContext(ctx, "DELETE FROM dashboard_history WHERE dashboard_id=?", id)
	if err != nil {
		return fmt.Errorf("delete dashboard history error: %w", err)
	}

	_, err = tx.ExecContext(ctx, "DELETE FROM annotation WHERE namespace_id=?", id)
	if err != nil {
		return fmt.Errorf("delete dashboard annotations error: %w", err)
	}

	return nil
}
