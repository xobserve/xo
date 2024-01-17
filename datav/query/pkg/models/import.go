package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/xObserve/xObserve/query/pkg/db"
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

	var jsonData []byte
	if dash.Data != nil {
		var err error
		jsonData, err = dash.Data.Encode()
		if err != nil {
			return err
		}

	}

	tags, err := json.Marshal(dash.Tags)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`INSERT INTO dashboard (id,title, team_id, created_by,tags, data, template_id, created,updated) VALUES (?,?,?,?,?,?,?,?,?)`,
		dash.Id, dash.Title, teamId, userId, tags, jsonData, dash.TemplateId, dash.Created, dash.Updated)
	if err != nil {
		return fmt.Errorf("insert dashboard error: %w", err)
	}

	tempDash := &Dashboard{}
	if dash.TemplateId != 0 {
		var tags []byte
		err := db.Conn.QueryRow("SELECT id,title,tags,visible_to,weight,editable FROM temp_dashboard WHERE team_id=? and id=?", teamId, dash.Id).Scan(
			&tempDash.Id, &tempDash.Title, &tags, &tempDash.VisibleTo, &tempDash.SortWeight, &tempDash.Editable,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil
			}
			return fmt.Errorf("query temp dashboard error: %w", err)
		}

		_, err = tx.Exec("UPDATE dashboard SET title=?,tags=?,visible_to=?,weight=?,editable=? WHERE team_id=? and id=?", tempDash.Title, tags, tempDash.VisibleTo, tempDash.SortWeight, tempDash.Editable, teamId, dash.Id)
		if err != nil {
			return fmt.Errorf("update dashboard error: %w", err)
		}
	}
	return nil
}

func ImportDatasource(ctx context.Context, ds *Datasource, tx *sql.Tx) error {
	var err error
	data, err := json.Marshal(ds.Data)
	if err != nil {
		return fmt.Errorf("encode datasource data error: %w", err)
	}
	now := time.Now()
	if ds.Id == 0 {
		ds.Id = now.UnixNano() / 1000
	}

	_, err = tx.ExecContext(ctx, "INSERT INTO datasource (id, name,type,url,team_id,data,template_id,created,updated) VALUES (?,?,?,?,?,?,?,?,?)", ds.Id, ds.Name, ds.Type, ds.URL, ds.TeamId, data, ds.TemplateId, now, now)
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
	_, err := tx.ExecContext(ctx, "INSERT INTO variable(id,name,type,value,default_selected,datasource,description,refresh,enableMulti,enableAll,regex,sort,team_id,template_id,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
		v.Id, v.Name, v.Type, v.Value, v.Default, v.Datasource, v.Desc, v.Refresh, v.EnableMulti, v.EnableAll, v.Regex, v.SortWeight, v.TeamId, v.TemplateId, now, now)
	if err != nil {
		return fmt.Errorf("insert variable error: %w", err)
	}

	return nil
}

func ImportSidemenu(ctx context.Context, templateId int64, teamId int64, items []*MenuItem, tx *sql.Tx) error {
	sidemenu, err := QuerySideMenu(ctx, teamId, tx)
	if err != nil {
		fmt.Println("here333333")
		return err
	}

	for _, s := range sidemenu.Data {
		for _, s1 := range s {
			if s1.TemplateId == templateId {
				//already import
				return nil
			}
		}
	}

	sidemenu.Data = append(sidemenu.Data, items)
	err = UpdateSideMenu(ctx, teamId, sidemenu.Data, tx)
	if err != nil {
		return err
	}

	return nil
}
