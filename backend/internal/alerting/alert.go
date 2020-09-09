package alerting

import (
	"time"

	"github.com/CodeCreatively/datav/backend/pkg/db"
	"github.com/CodeCreatively/datav/backend/pkg/models"
	"github.com/CodeCreatively/datav/backend/pkg/utils/simplejson"
)

func UpdateDashboardAlerts(dash *models.Dashboard) error {
	extractor := &DashAlertExtractor{dash}
	alerts, err := extractor.GetAlerts()
	if err != nil {
		logger.Warn("extrac alerts error", "error", err)
		return err
	}

	// delete old alerts
	_, err = db.SQL.Exec("DELETE FROM alert WHERE dashboard_id=?", dash.Id)
	if err != nil {
		logger.Warn("delete dashboard alert error", "error", err)
		return err
	}

	now := time.Now()
	for _, alert := range alerts {
		alert.Created = now
		alert.Updated = now
		alert.State = models.AlertStateUnknown
		alert.NewStateDate = now

		settings, _ := alert.Settings.Encode()
		_, err = db.SQL.Exec("INSERT INTO alert (dashboard_id,panel_id,name,message,state,new_state_date,state_changes,frequency,for,handler,silenced,execution_error,eval_data,settings,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
			alert.DashboardId, alert.PanelId, alert.Name, alert.Message, alert.State, alert.NewStateDate,
			alert.StateChanges, alert.Frequency, alert.For, alert.Handler, alert.Silenced, alert.ExecutionError, alert.EvalData, settings, alert.Created, alert.Updated)
		if err != nil {
			logger.Warn("insert dashboard alert error", "error", err)
			return err
		}
	}

	return nil
}

func GetAllAlerts() ([]*models.Alert, error) {
	rows, err := db.SQL.Query("SELECT * FROM alert")
	if err != nil {
		return nil, err
	}

	alerts := make([]*models.Alert, 0)
	for rows.Next() {
		alert := &models.Alert{}
		var settings []byte

		rows.Scan(&alert.Id, &alert.DashboardId, &alert.PanelId, &alert.Name, &alert.Message,
			&alert.State, &alert.NewStateDate, &alert.NewStateDate, &alert.Frequency, &alert.For,
			&alert.Handler, &alert.Silenced, &alert.ExecutionError, &alert.EvalData, &alert.EvalDate, &settings,
			&alert.Created, &alert.Updated)
	}

	return alerts, nil
}

func SetAlertState(alertId int64, state models.AlertStateType, annotationData *simplejson.Json, executionError string) (*models.Alert, error) {
	//@todo: alert
	return nil, nil
}
