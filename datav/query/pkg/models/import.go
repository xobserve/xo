package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
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

func ImportDatasource(ctx context.Context, ds *Datasource, u *User, tx *sql.Tx) error {
	var err error
	data, err := json.Marshal(ds.Data)
	if err != nil {
		return fmt.Errorf("encode datasource data error: %w", err)
	}
	now := time.Now()
	if ds.Id == 0 {
		ds.Id = now.UnixNano() / 1000
	}

	_, err = tx.ExecContext(ctx, "INSERT INTO datasource (id, name,type,url,team_id,data,created,updated) VALUES (?,?,?,?,?,?,?,?)", ds.Id, ds.Name, ds.Type, ds.URL, ds.TeamId, data, now, now)
	if err != nil {
		return fmt.Errorf("insert datasource error: %w", err)
	}

	return nil
}

func ImportVariable(ctx context.Context, v *Variable, tx *sql.Tx) error {
	if v.Id == 0 {
		v.Id = time.Now().UnixNano() / 1000
	}

	now := time.Now()
	_, err := tx.ExecContext(ctx, "INSERT INTO variable(id,name,type,value,default_selected,datasource,description,refresh,enableMulti,enableAll,regex,sort,team_id,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
		v.Id, v.Name, v.Type, v.Value, v.Default, v.Datasource, v.Desc, v.Refresh, v.EnableMulti, v.EnableAll, v.Regex, v.SortWeight, v.TeamId, now, now)
	if err != nil {
		return fmt.Errorf("insert variable error: %w", err)
	}

	return nil
}
