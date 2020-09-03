package models

import (
	"github.com/datadefeat/datav/backend/pkg/utils/null"
	"time"
	"github.com/datadefeat/datav/backend/pkg/utils/simplejson"
	"github.com/datadefeat/datav/backend/pkg/db"
)

type AlertStateType string
type NoDataOption string
type ExecutionErrorOption string

const (
	AlertStateNoData   AlertStateType = "no_data"
	AlertStatePaused   AlertStateType = "paused"
	AlertStateAlerting AlertStateType = "alerting"
	AlertStateOK       AlertStateType = "ok"
	AlertStatePending  AlertStateType = "pending"
	AlertStateUnknown  AlertStateType = "unknown"
)

const (
	NoDataSetOK       NoDataOption = "ok"
	NoDataSetNoData   NoDataOption = "no_data"
	NoDataKeepState   NoDataOption = "keep_state"
	NoDataSetAlerting NoDataOption = "alerting"
)

const (
	ExecutionErrorSetAlerting ExecutionErrorOption = "alerting"
	ExecutionErrorKeepState   ExecutionErrorOption = "keep_state"
)

type AlertMetric struct {
	Name string `json:"name"`
	Value null.Float `json:"value"`
}

type AlertNotification struct {
	Id                    int64            `json:"id"`
	Name                  string           `json:"name"`
	TeamId                int64  		   `json:"teamId"`
	Type                  string           `json:"type"`
	IsDefault             bool             `json:"isDefault"`
	SendReminder          bool             `json:"sendReminder"`
	DisableResolveMessage bool             `json:"disableResolveMessage"`
	UploadImage           bool 			   `json:"uploadImage"`
	Settings              *simplejson.Json `json:"settings"`

	CreatedBy             int64            `json:"createdBy"`
	Created               time.Time        `json:"created"`
	Updated               time.Time        `json:"updated"`
}


func QueryNotification(id int64) (*AlertNotification ,error){
	n := &AlertNotification{}
	var rawSettings []byte
	err := db.SQL.QueryRow(`SELECT team_id,name,type,is_default, disable_resolve_message, send_reminder, upload_image, settings FROM alert_notification WHERE id=?`,id).Scan(
		&n.TeamId, &n.Name, &n.Type, &n.IsDefault, &n.DisableResolveMessage, &n.SendReminder, &n.UploadImage, &rawSettings,
	)
	if err !=nil {
		return nil, err
	}

	settings := simplejson.New()
	err = settings.UnmarshalJSON(rawSettings)
	if err != nil {
		return nil,err
	}

	n.Settings = settings
	n.Id = id 
	
	return n,nil
}
