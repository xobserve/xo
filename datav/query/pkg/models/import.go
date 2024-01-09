package models

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/xObserve/xObserve/query/pkg/utils"
)

func ImportDashboardFromJSON(tx *sql.Tx, raw string, teamId int64, userId int64) (*Dashboard, error) {
	var dash *Dashboard
	err := json.Unmarshal([]byte(raw), &dash)
	if err != nil {
		return nil, err
	}

	err = ImportDashboard(tx, dash, teamId, userId)
	return dash, err
}

func ImportDashboard(tx *sql.Tx, dash *Dashboard, teamId int64, userId int64) error {
	now := time.Now()
	if dash.Id == "" {
		dash.Id = "d-" + utils.GenerateShortUID()
	}

	dash.Created = &now
	dash.Updated = &now

	jsonData, err := dash.Data.Encode()
	if err != nil {
		return err
	}

	tags, err := json.Marshal(dash.Tags)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`INSERT INTO dashboard (id,title, team_id, created_by,tags, data,created,updated) VALUES (?,?,?,?,?,?,?,?)`,
		dash.Id, dash.Title, teamId, userId, tags, jsonData, dash.Created, dash.Updated)
	if err != nil {
		return err
	}

	return nil
}
