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
	"encoding/json"
	"time"

	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/DataObserve/datav/backend/pkg/utils/simplejson"
)

const HomeDashboardId = "d-home"
const AlertDashbordId = "d-alert"

// you mustn't change the id of home dashboarda, is's reversed
var ReservedDashboardId = []string{HomeDashboardId, AlertDashbordId}

type Dashboard struct {
	Id       string `json:"id"`
	Title    string `json:"title"`
	Editable bool   `json:"editable,omitempty"`

	Created *time.Time `json:"created,omitempty"`
	Updated *time.Time `json:"updated,omitempty"`

	CreatedBy int64 `json:"createdBy,omitempty"`
	OwnedBy   int64 `json:"ownedBy,omitempty"` // team that ownes this dashboard

	Tags []string         `json:"tags,omitempty"`
	Data *simplejson.Json `json:"data,omitempty"`

	Variables []*Variable `json:"variables,omitempty"`
}

func QueryDashboard(id string) (*Dashboard, error) {
	dash := &Dashboard{}

	var rawJSON []byte
	var rawTags []byte
	err := db.Conn.QueryRow("SELECT title,tags,data,owned_by,updated FROM dashboard WHERE id = ?", id).Scan(&dash.Title, &rawTags, &rawJSON, &dash.OwnedBy, &dash.Updated)
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

	dash.Id = id
	return dash, nil
}

func QuertyDashboardStared(uid int64, dashId string) (bool, error) {
	var count int
	err := db.Conn.QueryRow("SELECT count(1) FROM star_dashboard WHERE user_id=? and dashboard_id=?", uid, dashId).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func QueryDashboardsByTeamId(teamId int64) ([]*Dashboard, error) {
	dashboards := make([]*Dashboard, 0)
	rows, err := db.Conn.Query(`SELECT id FROM dashboard WHERE owned_by=?`, teamId)
	if err != nil {
		return nil, err
	}

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

func QueryDashboardBelongsTo(id string) (int64, error) {
	var teamId int64
	err := db.Conn.QueryRow("SELECT owned_by FROM dashboard WHERE id = ?", id).Scan(&teamId)
	if err != nil {
		return 0, err
	}

	return teamId, nil
}
