package dashboard

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/xobserve/xo/query/pkg/db"
	"github.com/xobserve/xo/query/pkg/models"
	"github.com/xobserve/xo/query/pkg/utils"
)

func ImportFromJSON(ctx context.Context, raw string, teamId int64, userId int64) (*models.Dashboard, error) {
	var dash *models.Dashboard
	err := json.Unmarshal([]byte(raw), &dash)
	if err != nil {
		return nil, err
	}

	var isNew bool = false
	err = models.IsDashboardExist(ctx, dash.OwnedBy, dash.Id)
	if err != nil {
		isNew = true
	}

	now := time.Now()
	if dash.Id == "" {
		dash.Id = "d-" + utils.GenerateShortUID()
	}

	dash.CreatedBy = userId
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

	links, err := json.Marshal(dash.Links)
	if err != nil {
		return nil, err
	}

	if isNew {
		_, err = db.Conn.Exec(`INSERT INTO dashboard (id,title, team_id,visible_to, created_by,tags, data,links, created,updated) VALUES (?,?,?,?,?,?,?,?,?,?)`,
			dash.Id, dash.Title, teamId, dash.VisibleTo, dash.CreatedBy, tags, jsonData, links, dash.Created, dash.Updated)
		if err != nil {
			return nil, err
		}
	} else {
		var res sql.Result
		var err error
		if dash.TemplateId != 0 { // template dashboard can only edit title, tags, visible_to,tags
			res, err = db.Conn.ExecContext(ctx, `UPDATE dashboard SET title=?,tags=?,visible_to=?,links=? WHERE team_id=? and id=?`,
				dash.Title, tags, dash.VisibleTo, links, dash.OwnedBy, dash.Id)
		} else {
			res, err = db.Conn.ExecContext(ctx, `UPDATE dashboard SET title=?,tags=?,data=?,visible_to=?,links=?,updated=? WHERE team_id=? and id=?`,
				dash.Title, tags, jsonData, dash.VisibleTo, links, dash.Updated, dash.OwnedBy, dash.Id)
		}
		if err != nil {
			logger.Error("update dashboard error", "error", err)
			return nil, err
		}
		affected, _ := res.RowsAffected()
		if affected == 0 {
			logger.Error("dashboard id not exist")
		}
	}

	return dash, nil
}
