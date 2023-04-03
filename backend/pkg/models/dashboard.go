package models

import (
	"time"

	"github.com/ai-apm/aiapm/backend/pkg/db"
	"github.com/ai-apm/aiapm/backend/pkg/utils/simplejson"
)

// you mustn't change the id of home dashboarda, is's reversed
const HomeDashboardId = "home"

type Dashboard struct {
	Id       string `json:"id"`
	Title    string `json:"title"`
	Editable bool   `json:"editable,omitempty"`

	Created *time.Time `json:"created,omitempty"`
	Updated *time.Time `json:"updated,omitempty"`

	CreatedBy int64 `json:"createdBy,omitempty"`
	OwnedBy   int64 `json:"ownedBy,omitempty"` // team that ownes this dashboard

	Data *simplejson.Json `json:"data,omitempty"`

	Variables []*Variable `json:"variables,omitempty"`
}

func QueryDashboard(id string) (*Dashboard, error) {
	dash := &Dashboard{}

	var rawJSON []byte
	err := db.Conn.QueryRow("SELECT title,data,owned_by FROM dashboard WHERE id = ?", id).Scan(&dash.Title, &rawJSON, &dash.OwnedBy)
	if err != nil {
		return nil, err
	}

	data := simplejson.New()
	err = data.UnmarshalJSON(rawJSON)
	if err != nil {
		return nil, err
	}
	dash.Data = data

	dash.Id = id

	return dash, nil
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
