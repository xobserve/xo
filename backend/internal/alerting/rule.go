package alerting

import (
	"fmt"
	"time"

	"github.com/datadefeat/datav/backend/pkg/models"

	"github.com/datadefeat/datav/backend/pkg/utils/simplejson"
)

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
	NoDataState         models.NoDataOption
	ExecutionErrorState models.ExecutionErrorOption
	State               models.AlertStateType
	Conditions          []Condition
	Notifications       []int64
	AlertRuleTags       []*models.Tag

	StateChanges int64
}

// ValidationError is a typed error with meta data
// about the validation error.
type ValidationError struct {
	Reason      string
	Err         error
	AlertID     int64
	DashboardID int64
	PanelID     int64
}

func (e ValidationError) Error() string {
	extraInfo := e.Reason
	if e.AlertID != 0 {
		extraInfo = fmt.Sprintf("%s AlertId: %v", extraInfo, e.AlertID)
	}

	if e.PanelID != 0 {
		extraInfo = fmt.Sprintf("%s PanelId: %v", extraInfo, e.PanelID)
	}

	if e.DashboardID != 0 {
		extraInfo = fmt.Sprintf("%s DashboardId: %v", extraInfo, e.DashboardID)
	}

	if e.Err != nil {
		return fmt.Sprintf("Alert validation error: %s%s", e.Err.Error(), extraInfo)
	}

	return fmt.Sprintf("Alert validation error: %s", extraInfo)
}

// NewRuleFromDBAlert maps a db version of
// alert to an in-memory version.
func NewRuleFromDBAlert(ruleDef *models.Alert) (*Rule, error) {
	model := &Rule{}
	model.ID = ruleDef.Id
	model.DashboardID = ruleDef.DashboardId
	model.PanelID = ruleDef.PanelId
	model.Name = ruleDef.Name
	model.Message = ruleDef.Message
	model.State = ruleDef.State
	model.LastStateChange = ruleDef.NewStateDate
	model.For = ruleDef.For
	model.NoDataState = models.NoDataOption(ruleDef.Settings.Get("noDataState").MustString("no_data"))
	model.ExecutionErrorState = models.ExecutionErrorOption(ruleDef.Settings.Get("executionErrorState").MustString("alerting"))
	model.StateChanges = ruleDef.StateChanges

	model.Frequency = ruleDef.Frequency
	// frequency cannot be zero since that would not execute the alert rule.
	// so we fallback to 60 seconds if `Frequency` is missing
	if model.Frequency == 0 {
		model.Frequency = 60
	}

	for _, v := range ruleDef.Settings.Get("notifications").MustArray() {
		jsonModel := simplejson.NewFromAny(v)
		if id, err := jsonModel.Get("id").Int64(); err == nil {
			model.Notifications = append(model.Notifications, id)
		} else {
			return nil, ValidationError{Reason: "Neither id nor uid is specified in 'notifications' block, " + err.Error(), DashboardID: model.DashboardID, AlertID: model.ID, PanelID: model.PanelID}
		}
	}
	model.AlertRuleTags = ruleDef.GetTagsFromSettings()

	for index, condition := range ruleDef.Settings.Get("conditions").MustArray() {
		conditionModel := simplejson.NewFromAny(condition)
		conditionType := conditionModel.Get("type").MustString()
		factory, exist := conditionFactories[conditionType]
		if !exist {
			return nil, ValidationError{Reason: "Unknown alert condition: " + conditionType, DashboardID: model.DashboardID, AlertID: model.ID, PanelID: model.PanelID}
		}
		queryCondition, err := factory(conditionModel, index)
		if err != nil {
			return nil, ValidationError{Err: err, DashboardID: model.DashboardID, AlertID: model.ID, PanelID: model.PanelID}
		}
		model.Conditions = append(model.Conditions, queryCondition)
	}

	if len(model.Conditions) == 0 {
		return nil, ValidationError{Reason: "Alert is missing conditions"}
	}

	return model, nil
}

// ConditionFactory is the function signature for creating `Conditions`.
type ConditionFactory func(model *simplejson.Json, index int) (Condition, error)

var conditionFactories = make(map[string]ConditionFactory)

// RegisterCondition adds support for alerting conditions.
func RegisterCondition(typeName string, factory ConditionFactory) {
	conditionFactories[typeName] = factory
}
