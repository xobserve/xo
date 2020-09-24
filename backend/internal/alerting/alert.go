package alerting

import (
	"encoding/json"
	"time"

	"github.com/code-creatively/datav/backend/pkg/db"
	"github.com/code-creatively/datav/backend/pkg/models"
	"github.com/code-creatively/datav/backend/pkg/utils/simplejson"
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

	// delete old alerts notification state
	_, err = db.SQL.Exec("DELETE FROM alert_states WHERE dashboard_id=?", dash.Id)
	if err != nil {
		logger.Warn("delete alert notification state error", "error", err)
		return err
	}

	now := time.Now()
	for _, alert := range alerts {
		alert.Created = now
		alert.Updated = now
		alert.State = models.AlertStateUnknown
		alert.NewStateDate = now

		settings, _ := alert.Settings.Encode()
		sendexp, _ := json.Marshal(alert.SendExceptions)
		_, err = db.SQL.Exec("INSERT INTO alert (dashboard_id,panel_id,name,message,state,new_state_date,state_changes,frequency,for,handler,silenced,execution_error,settings,send_exceptions,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
			alert.DashboardId, alert.PanelId, alert.Name, alert.Message, alert.State, alert.NewStateDate,
			alert.StateChanges, alert.Frequency, alert.For, alert.Handler, alert.Silenced, alert.ExecutionError, settings, sendexp, alert.Created, alert.Updated)
		if err != nil {
			logger.Warn("insert dashboard alert error", "error", err)
			return err
		}
	}

	return nil
}

func GetAlert(id int64) (*models.Alert, error) {
	alert := &models.Alert{}
	var settings []byte
	var sendexp []byte
	err := db.SQL.QueryRow("SELECT * FROM alert WHERE id=?", id).Scan(&alert.Id, &alert.DashboardId, &alert.PanelId, &alert.Name, &alert.Message,
		&alert.State, &alert.NewStateDate, &alert.StateChanges, &alert.Frequency, &alert.For,
		&alert.Handler, &alert.Silenced, &alert.ExecutionError, &settings, &sendexp,
		&alert.Created, &alert.Updated)
	if err != nil {
		logger.Warn("get alert error", "error", err)
		return nil, err
	}

	err = json.Unmarshal(settings, &alert.Settings)
	if err != nil {
		logger.Warn("unmarshal all alerts error", "error", err)
		return nil, err
	}

	err = json.Unmarshal(sendexp, &alert.SendExceptions)
	if err != nil {
		logger.Warn("unmarshal all alerts error", "error", err)
		return nil, err
	}

	return alert, nil
}

func UpdateAlert(alert *models.Alert) error {
	now := time.Now()
	_, err := db.SQL.Exec("UPDATE alert SET state=?, new_state_date=?, state_changes=?, execution_error=?, updated=? WHERE id=?",
		alert.State, alert.NewStateDate, alert.StateChanges, alert.ExecutionError, now, alert.Id)
	if err != nil {
		logger.Warn("update alert error", "error", err)
		return err
	}

	return nil
}

func SetAlertState(alertId int64, state models.AlertStateType, annotationData *simplejson.Json, executionError string) (*models.Alert, error) {
	alert, err := GetAlert(alertId)
	if err != nil {
		return nil, err
	}

	if alert.State == models.AlertStatePaused {
		return nil, models.ErrCannotChangeStateOnPausedAlert
	}

	if alert.State == state {
		return nil, models.ErrRequiresNewState
	}

	alert.State = state
	alert.StateChanges++
	alert.NewStateDate = time.Now()

	if executionError == "" {
		alert.ExecutionError = "" //without this space, xorm skips updating this field
	} else {
		alert.ExecutionError = executionError
	}

	err = UpdateAlert(alert)
	if err != nil {
		return nil, err
	}

	return alert, nil
}
