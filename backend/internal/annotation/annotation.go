package annotation

import (
	"github.com/codecc-com/datav/backend/pkg/db"
	"github.com/codecc-com/datav/backend/pkg/models"
	"github.com/codecc-com/datav/backend/pkg/log"
)

var logger = log.RootLogger.New("logger","bootConfig")

func QueryAnnotation(id int64) (*models.Annotation,error) {
	an := &models.Annotation{}
	err := db.SQL.QueryRow("SELECT dashboard_id,panel_id,text,time,time_end,created_by FROM annotation WHERE id=?",id).Scan(&an.DashboardId,&an.PanelId,&an.Text,&an.Time,&an.TimeEnd,&an.CreatedBy)
	if err != nil {
		return nil,err
	}

	return an,nil
}