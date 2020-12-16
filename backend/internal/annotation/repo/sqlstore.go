package repo

import (
	"time"

	"github.com/opendatav/datav/backend/pkg/log"
	"github.com/opendatav/datav/backend/pkg/utils/simplejson"

	"github.com/opendatav/datav/backend/pkg/db"
	"github.com/opendatav/datav/backend/pkg/models"
)

var logger = log.RootLogger.New("logger", "annotation/repo")

type SqlStore struct{}

func (s *SqlStore) Create(ann *models.Annotation) error {
	now := time.Now()
	// alert_id            INTEGER,
	// prev_state			VARCHAR(25) NOT NULL,
	// new_state			VARCHAR(25) NOT NULL,
	// data 				TEXT NOT NULL,
	if ann.Data == nil {
		ann.Data = simplejson.New()
	}
	data, _ := ann.Data.Encode()
	_, err := db.SQL.Exec("INSERT INTO annotation (dashboard_id, panel_id, text, time, time_end,alert_id,prev_state,new_state,data, created_by, created,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
		ann.DashboardId, ann.PanelId, ann.Text, ann.Time, ann.TimeEnd, ann.AlertId, ann.PrevState, ann.NewState, data, ann.CreatedBy, now, now)
	return err
}

func (s *SqlStore) Update(ann *models.Annotation) error {
	now := time.Now()
	_, err := db.SQL.Exec("UPDATE annotation SET text=?, updated=? WHERE id=?", ann.Text, now, ann.Id)
	return err
}

func (s *SqlStore) Delete(id int64) error {
	_, err := db.SQL.Exec("DELETE FROM annotation WHERE id=?", id)
	return err
}

func (s *SqlStore) Find(query *models.AnnotationQuery) ([]*models.Annotation, error) {
	ans := make([]*models.Annotation, 0)
	rows, err := db.SQL.Query("SELECT id,panel_id,text,time,time_end,prev_state,new_state,alert_id FROM annotation WHERE dashboard_id=? and time >= ? and time <= ?",
		query.DashboardId, query.From, query.To)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		an := &models.Annotation{}
		err := rows.Scan(&an.Id, &an.PanelId, &an.Text, &an.Time, &an.TimeEnd, &an.PrevState, &an.NewState, &an.AlertId)
		if err != nil {
			logger.Warn("query annotations scan error", "error", err)
			continue
		}
		ans = append(ans, an)
	}

	return ans, nil
}
