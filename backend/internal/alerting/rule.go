package alerting

import (
	"fmt"

	"github.com/code-creatively/datav/backend/internal/alerting/conditions"
	"github.com/code-creatively/datav/backend/pkg/models"

	"github.com/code-creatively/datav/backend/pkg/utils/simplejson"
)

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
		return fmt.Sprintf("Alert validation error1: %s%s", e.Err.Error(), extraInfo)
	}

	return fmt.Sprintf("Alert validation error2: %s", extraInfo)
}

// NewRuleFromDBAlert maps a db version of
// alert to an in-memory version.
func NewRuleFromDBAlert(ruleDef *models.Alert) (*models.Rule, error) {
	model := &models.Rule{}
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
	model.SendExceptions = ruleDef.SendExceptions
	model.Frequency = ruleDef.Frequency
	// frequency cannot be zero since that would not execute the alert rule.
	// so we fallback to 60 seconds if `Frequency` is missing
	if model.Frequency == 0 {
		model.Frequency = 60
	}

	for _, v := range ruleDef.Settings.Get("notifications").MustArray() {
		jsonModel := simplejson.NewFromAny(v)
		id, _ := jsonModel.Int64()
		model.Notifications = append(model.Notifications, id)
	}
	model.AlertRuleTags = ruleDef.GetTagsFromSettings()

	for index, condition := range ruleDef.Settings.Get("conditions").MustArray() {
		conditionModel := simplejson.NewFromAny(condition)
		conditionType := conditionModel.Get("type").MustString()
		factory, exist := conditions.Factories[conditionType]
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
