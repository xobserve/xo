package models

import (
	"time"

	"github.com/codecc-com/datav/backend/pkg/db"
	"github.com/codecc-com/datav/backend/pkg/utils/null"
	"github.com/codecc-com/datav/backend/pkg/utils/simplejson"
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

func (s AlertStateType) IsValid() bool {
	return s == AlertStateOK ||
		s == AlertStateNoData ||
		s == AlertStatePaused ||
		s == AlertStatePending ||
		s == AlertStateAlerting ||
		s == AlertStateUnknown
}

func (s NoDataOption) IsValid() bool {
	return s == NoDataSetNoData || s == NoDataSetAlerting || s == NoDataKeepState || s == NoDataSetOK
}

func (s NoDataOption) ToAlertState() AlertStateType {
	return AlertStateType(s)
}

func (s ExecutionErrorOption) IsValid() bool {
	return s == ExecutionErrorSetAlerting || s == ExecutionErrorKeepState
}

func (s ExecutionErrorOption) ToAlertState() AlertStateType {
	return AlertStateType(s)
}

type AlertMetric struct {
	Name  string     `json:"name"`
	Value null.Float `json:"value"`
}

type AlertNotification struct {
	Id                    int64            `json:"id"`
	Name                  string           `json:"name"`
	TeamId                int64            `json:"teamId"`
	Type                  string           `json:"type"`
	IsDefault             bool             `json:"isDefault"`
	SendReminder          bool             `json:"sendReminder"`
	DisableResolveMessage bool             `json:"disableResolveMessage"`
	UploadImage           bool             `json:"uploadImage"`
	Settings              *simplejson.Json `json:"settings"`

	CreatedBy int64     `json:"createdBy"`
	Created   time.Time `json:"created"`
	Updated   time.Time `json:"updated"`
}

func QueryNotification(id int64) (*AlertNotification, error) {
	n := &AlertNotification{}
	var rawSettings []byte
	err := db.SQL.QueryRow(`SELECT team_id,name,type,is_default, disable_resolve_message, send_reminder, upload_image, settings FROM alert_notification WHERE id=?`, id).Scan(
		&n.TeamId, &n.Name, &n.Type, &n.IsDefault, &n.DisableResolveMessage, &n.SendReminder, &n.UploadImage, &rawSettings,
	)
	if err != nil {
		return nil, err
	}

	settings := simplejson.New()
	err = settings.UnmarshalJSON(rawSettings)
	if err != nil {
		return nil, err
	}

	n.Settings = settings
	n.Id = id

	return n, nil
}

func NewDashboardFromJson(data *simplejson.Json) *Dashboard {
	dash := &Dashboard{}
	dash.Data = data
	dash.Title = dash.Data.Get("title").MustString()
	dash.UpdateSlug()
	update := false

	if id, err := dash.Data.Get("id").Float64(); err == nil {
		dash.Id = int64(id)
		update = true
	}

	if uid, err := dash.Data.Get("uid").String(); err == nil {
		dash.Uid = uid
		update = true
	}

	if version, err := dash.Data.Get("version").Float64(); err == nil && update {
		dash.Version = int(version)
		dash.Updated = time.Now()
	} else {
		dash.Data.Set("version", 0)
		dash.Created = time.Now()
		dash.Updated = time.Now()
	}

	return dash
}

type Alert struct {
	Id             int64
	Version        int64
	DashboardId    int64
	PanelId        int64
	Name           string
	Message        string
	Severity       string //Unused
	State          AlertStateType
	Handler        int64 //Unused
	Silenced       bool
	ExecutionError string
	Frequency      int64
	For            time.Duration

	EvalData     *simplejson.Json
	NewStateDate time.Time
	StateChanges int64

	Created time.Time
	Updated time.Time

	Settings *simplejson.Json
}

func (alert *Alert) GetTagsFromSettings() []*Tag {
	tags := []*Tag{}
	if alert.Settings != nil {
		if data, ok := alert.Settings.CheckGet("alertRuleTags"); ok {
			for tagNameString, tagValue := range data.MustMap() {
				// MustMap() already guarantees the return of a `map[string]interface{}`.
				// Therefore we only need to verify that tagValue is a String.
				tagValueString := simplejson.NewFromAny(tagValue).MustString()
				tags = append(tags, &Tag{Key: tagNameString, Value: tagValueString})
			}
		}
	}
	return tags
}

func (alert *Alert) ValidToSave() bool {
	return alert.DashboardId != 0 && alert.PanelId != 0
}

// ConditionResult is the result of a condition evaluation.
type ConditionResult struct {
	Firing      bool
	NoDataFound bool
	Operator    string
	EvalMatches []*EvalMatch
}

// Condition is responsible for evaluating an alert condition.
type Condition interface {
	Eval(result *EvalContext) (*ConditionResult, error)
}

// EvalMatch represents the series violating the threshold.
type EvalMatch struct {
	Value  null.Float        `json:"value"`
	Metric string            `json:"metric"`
	Tags   map[string]string `json:"tags"`
}

// ResultLogEntry represents log data for the alert evaluation.
type ResultLogEntry struct {
	Message string
	Data    interface{}
}

// Rule is the in-memory version of an alert rule.
type Rule struct {
	ID                  int64
	DashboardID         int64
	PanelID             int64
	Frequency           int64
	Name                string
	Message             string
	LastStateChange     time.Time
	For                 time.Duration
	NoDataState         NoDataOption
	ExecutionErrorState ExecutionErrorOption
	State               AlertStateType
	Conditions          []Condition
	Notifications       []int64
	AlertRuleTags       []*Tag

	StateChanges int64
}

type AlertTestResultLog struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}
