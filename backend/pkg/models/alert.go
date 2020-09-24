package models

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/code-creatively/datav/backend/pkg/db"
	"github.com/code-creatively/datav/backend/pkg/utils/null"
	"github.com/code-creatively/datav/backend/pkg/utils/simplejson"
)

const DefaultEvaluatorParamLabel = "__Default"

type AlertStateType string
type NoDataOption string
type ExecutionErrorOption string

const (
	AlertStateAll      AlertStateType = "all"
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

var (
	ErrCannotChangeStateOnPausedAlert = fmt.Errorf("Cannot change state on pause alert")
	ErrRequiresNewState               = fmt.Errorf("update alert state requires a new state")
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
	Frequency             time.Duration    `json:"frequency"`
	CreatedBy             int64            `json:"createdBy"`
	Created               time.Time        `json:"created"`
	Updated               time.Time        `json:"updated"`
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
	SendExceptions []*SendException
	NewStateDate   time.Time
	StateChanges   int64

	Created time.Time
	Updated time.Time

	Settings *simplejson.Json
}

type SendException struct {
	Type       string `json:"type"`
	LabelName  string `json:"labelName"`
	LabelValue string `json:"labelValue"`
	Setting    string `json:"setting"`
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
	Operator    string
	EvalMatches []*EvalMatch
}

// Condition is responsible for evaluating an alert condition.
type Condition interface {
	Eval(result *EvalContext) (*ConditionResult, error)
}

// EvalMatch represents the series violating the threshold.
type EvalMatch struct {
	Firing      bool
	NoDataFound bool
	Value       null.Float        `json:"value"`
	Metric      string            `json:"metric"`
	Tags        map[string]string `json:"tags"`
}

// ResultLogEntry represents log data for the alert evaluation.
type ResultLogEntry struct {
	Message string
	Data    interface{}
}

// Rule is the in-memory version of an alert rule.
type Rule struct {
	ID                  int64 // alert id
	DashboardID         int64
	PanelID             int64
	TeamID              int64
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
	SendExceptions      []*SendException

	StateChanges int64
}

type AlertTestResultLog struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type AlertState struct {
	LastStateChange time.Time      `json:"lastStateChange"`
	State           AlertStateType `json:"state"`
	Changed         bool           `json:"-"`
}

// Job holds state about when the alert rule should be evaluated.
type Job struct {
	Offset      int64
	OffsetWait  bool
	Delay       bool
	running     bool
	Rule        *Rule
	runningLock sync.Mutex // Lock for running property which is used in the Scheduler and AlertEngine execution
}

// GetRunning returns true if the job is running. A lock is taken and released on the Job to ensure atomicity.
func (j *Job) GetRunning() bool {
	defer j.runningLock.Unlock()
	j.runningLock.Lock()
	return j.running
}

// SetRunning sets the running property on the Job. A lock is taken and released on the Job to ensure atomicity.
func (j *Job) SetRunning(b bool) {
	j.runningLock.Lock()
	j.running = b
	j.runningLock.Unlock()
}

type AlertNotificationStateType string

type AlertStates struct {
	Id                           int64
	DashId                       int64
	AlertId                      int64
	States                       map[string]*AlertState
	Version                      int64
	UpdatedAt                    int64
	AlertRuleStateUpdatedVersion int64
}

func GetAlertNotificationsByIds(ids []int64) []*AlertNotification {
	nos := make([]*AlertNotification, 0)
	for _, id := range ids {
		n := &AlertNotification{}
		var rawSetting []byte
		err := db.SQL.QueryRow(`SELECT id,team_id,name,type,is_default, disable_resolve_message, send_reminder, upload_image, settings FROM alert_notification WHERE id=?`, id).Scan(&n.Id, &n.TeamId, &n.Name, &n.Type, &n.IsDefault, &n.DisableResolveMessage, &n.SendReminder, &n.UploadImage, &rawSetting)
		if err != nil {
			logger.Warn("scan alerting notification error", "error", err)
			continue
		}

		setting := simplejson.New()
		err = setting.UnmarshalJSON(rawSetting)
		if err != nil {
			logger.Warn("unmarshal alerting notification setting error", "error", err)
			continue
		}
		n.Settings = setting

		nos = append(nos, n)
	}

	return nos
}

var (
	AlertNotificationStatePending   = AlertNotificationStateType("pending")
	AlertNotificationStateCompleted = AlertNotificationStateType("completed")
	AlertNotificationStateUnknown   = AlertNotificationStateType("unknown")
)

var (
	ErrNotificationFrequencyNotFound            = errors.New("Notification frequency not specified")
	ErrAlertNotificationStateNotFound           = errors.New("alert notification state not found")
	ErrAlertNotificationStateVersionConflict    = errors.New("alert notification state update version conflict")
	ErrAlertNotificationStateAlreadyExist       = errors.New("alert notification state already exists")
	ErrAlertNotificationFailedGenerateUniqueUid = errors.New("Failed to generate unique alert notification uid")
)

func GetOrCreateAlertStates(dashId int64, alertId int64) (*AlertStates, error) {
	ans := &AlertStates{
		DashId:  dashId,
		AlertId: alertId,
	}

	var states []byte
	err := db.SQL.QueryRow("SELECT id,states,version,updated_at,alert_rule_state_updated_version FROM alert_states WHERE alert_id=?", alertId).Scan(
		&ans.Id, &states, &ans.Version, &ans.UpdatedAt, &ans.AlertRuleStateUpdatedVersion,
	)
	if err == nil {
		json.Unmarshal(states, &ans.States)
		return ans, nil
	}

	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	ans.States = make(map[string]*AlertState)
	ans.UpdatedAt = time.Now().Unix()

	states, err = json.Marshal(ans.States)
	res, err := db.SQL.Exec("INSERT INTO alert_states (dashboard_id,alert_id, states,version,updated_at,alert_rule_state_updated_version) VALUES (?,?,?,?,?,?)",
		dashId, ans.AlertId, states, ans.Version, ans.UpdatedAt, ans.AlertRuleStateUpdatedVersion)
	if err != nil {
		return nil, err
	}

	nid, _ := res.LastInsertId()
	ans.Id = nid

	return ans, nil
}

func SetAlertStates(alertId int64, states map[string]*AlertState, version int64) error {
	data, err := json.Marshal(states)
	if err != nil {
		return err
	}

	_, err = db.SQL.Exec("UPDATE alert_states SET states=?,version=?,updated_at=? WHERE alert_id=?", data, version, time.Now().Unix(), alertId)
	if err != nil {
		return err
	}

	return nil
}

func SetAlertState(alertId int64, state AlertStateType, stateChanges int64) error {
	now := time.Now()
	_, err := db.SQL.Exec("UPDATE alert SET state=?, new_state_date=?,state_changes=?, updated=? WHERE id=?",
		state, now, stateChanges, now, alertId)
	if err != nil {
		return err
	}

	return nil
}

type AlertHistory struct {
	ID           int64          `json:"id"`
	AlertName    string         `json:"alertName"`
	DashboardID  int64          `json:"dashId"`
	PanelID      int64          `json:"panelId"`
	DashboardUrl string         `json:"dashboardUrl"`
	State        AlertStateType `json:"state"`
	Matches      []*EvalMatch   `json:"matches"`
	Time         int64          `json:"time"`
	TimeUnix     int64          `json:"timeUnix"`
}
type AlertHistories []*AlertHistory

func (ah AlertHistories) Len() int      { return len(ah) }
func (ah AlertHistories) Swap(i, j int) { ah[i], ah[j] = ah[j], ah[i] }
func (ah AlertHistories) Less(i, j int) bool {
	return ah[i].Time > ah[j].Time
}

func AddAlertHistory(context *EvalContext) {
	dashId := context.Rule.DashboardID
	panelId := context.Rule.PanelID
	if dashId == 0 || panelId == 0 {
		logger.Error("add alert history param error", "error", "dashid or panelid is empty")
		return
	}

	now := time.Now()
	matches, _ := json.Marshal(context.EvalMatches)
	_, err := db.SQL.Exec("INSERT INTO alert_history (dashboard_id,panel_id,state,matches,created) VALUES (?,?,?,?,?)",
		context.Rule.DashboardID, context.Rule.PanelID, context.Rule.State, matches, now)
	if err != nil {
		logger.Error("add alert history error", "error", err)
	}

}

func GetAllAlerts() ([]*Alert, error) {
	rows, err := db.SQL.Query("SELECT * FROM alert")
	if err != nil {
		return nil, err
	}

	alerts := make([]*Alert, 0)
	for rows.Next() {
		alert := &Alert{}
		var settings []byte
		var sendexp []byte
		err := rows.Scan(&alert.Id, &alert.DashboardId, &alert.PanelId, &alert.Name, &alert.Message,
			&alert.State, &alert.NewStateDate, &alert.StateChanges, &alert.Frequency, &alert.For,
			&alert.Handler, &alert.Silenced, &alert.ExecutionError, &settings, &sendexp,
			&alert.Created, &alert.Updated)
		if err != nil {
			logger.Warn("scan all alerts error", "error", err)
		}

		err = json.Unmarshal(settings, &alert.Settings)
		if err != nil {
			logger.Warn("unmarshal all alerts error", "error", err)
		}

		err = json.Unmarshal(sendexp, &alert.SendExceptions)
		if err != nil {
			logger.Warn("unmarshal all alerts error", "error", err)
		}

		alerts = append(alerts, alert)
	}

	return alerts, nil
}
