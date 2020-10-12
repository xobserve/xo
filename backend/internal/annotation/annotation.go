package annotation

import (
	"github.com/apm-ai/datav/backend/internal/annotation/repo"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/log"
	"github.com/apm-ai/datav/backend/pkg/models"
)

var logger = log.RootLogger.New("logger", "bootConfig")

func Init() {
	models.SetAnnotationRepo(&repo.SqlStore{})
}

func QueryAnnotation(id int64) (*models.Annotation, error) {
	an := &models.Annotation{}
	err := db.SQL.QueryRow("SELECT dashboard_id,panel_id,text,time,time_end,created_by FROM annotation WHERE id=?", id).Scan(&an.DashboardId, &an.PanelId, &an.Text, &an.Time, &an.TimeEnd, &an.CreatedBy)
	if err != nil {
		return nil, err
	}

	return an, nil
}
