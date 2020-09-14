package models

import (
	"database/sql"
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

	EvalData *simplejson.Json
	EvalDate *time.Time

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

	StateChanges int64
}

type AlertTestResultLog struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
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

type AlertNotificationState struct {
	Id                           int64
	OrgId                        int64
	AlertId                      int64
	NotifierId                   int64
	State                        AlertNotificationStateType
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

func GetOrCreateAlertNotificationState(dashId int64, alertId int64, notifierId int64) (*AlertNotificationState, error) {
	ans := &AlertNotificationState{
		AlertId:    alertId,
		NotifierId: notifierId,
	}
	err := db.SQL.QueryRow("SELECT id,state,version,updated_at,alert_rule_state_updated_version FROM alert_notification_state WHERE alert_id=? and notifier_id=?", alertId, notifierId).Scan(
		&ans.Id, &ans.State, &ans.Version, &ans.UpdatedAt, &ans.AlertRuleStateUpdatedVersion,
	)

	if err == nil {
		return ans, nil
	}

	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	ans.State = AlertNotificationStateUnknown
	ans.UpdatedAt = time.Now().Unix()

	res, err := db.SQL.Exec("INSERT INTO alert_notification_state (dashboard_id,alert_id, notifier_id, state,version,updated_at,alert_rule_state_updated_version) VALUES (?,?,?,?,?,?,?)",
		dashId, ans.AlertId, ans.NotifierId, ans.State, ans.Version, ans.UpdatedAt, ans.AlertRuleStateUpdatedVersion)
	if err != nil {
		return nil, err
	}

	nid, _ := res.LastInsertId()
	ans.Id = nid

	return ans, nil
}

func SetAlertNotificationStateToComplete(id int64, version int64) error {
	_, err := db.SQL.Exec("UPDATE alert_notification_state SET state=?, version=?, updated_at=? WHERE id=?",
		AlertNotificationStateCompleted, version+1, time.Now().Unix(), id)
	if err != nil {
		return err
	}

	return nil
}

func SetAlertNotificationStateToPendingCommand(id int64, version int64, updateVersion int64) (int64, error) {
	newVer := version + 1
	res, err := db.SQL.Exec("UPDATE alert_notification_state SET state=?, version=?, updated_at=? ,alert_rule_state_updated_version=?  WHERE id=? AND (version = ? OR alert_rule_state_updated_version < ?)",
		AlertNotificationStatePending, newVer, time.Now().Unix(), updateVersion, id, version, updateVersion)
	if err != nil && err != sql.ErrNoRows {
		return 0, err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return 0, ErrAlertNotificationStateVersionConflict
	}

	return newVer, nil
}
