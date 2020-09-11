package models

import (
	"context"
	"fmt"
	"time"

	"github.com/code-creatively/datav/backend/pkg/config"

	"github.com/inconshreveable/log15"
)

// EvalContext is the context object for an alert evaluation.
type EvalContext struct {
	Firing         bool
	IsTestRun      bool
	IsDebug        bool
	EvalMatches    []*EvalMatch
	Logs           []*ResultLogEntry
	Error          error
	ConditionEvals string
	StartTime      time.Time
	EndTime        time.Time
	Rule           *Rule

	log log15.Logger

	dashboardRef *DashboardRef

	ImagePublicURL  string
	ImageOnDiskPath string
	NoDataFound     bool
	PrevAlertState  AlertStateType

	Ctx context.Context
}

// NewEvalContext is the EvalContext constructor.
func NewEvalContext(alertCtx context.Context, rule *Rule, logger log15.Logger) *EvalContext {
	return &EvalContext{
		Ctx:            alertCtx,
		StartTime:      time.Now(),
		Rule:           rule,
		Logs:           make([]*ResultLogEntry, 0),
		EvalMatches:    make([]*EvalMatch, 0),
		PrevAlertState: rule.State,
		log:            logger,
	}
}

// StateDescription contains visual information about the alert state.
type StateDescription struct {
	Color string
	Text  string
	Data  string
}

// GetStateModel returns the `StateDescription` based on current state.
func (c *EvalContext) GetStateModel() *StateDescription {
	switch c.Rule.State {
	case AlertStateOK:
		return &StateDescription{
			Color: "#36a64f",
			Text:  "OK",
		}
	case AlertStateNoData:
		return &StateDescription{
			Color: "#888888",
			Text:  "No Data",
		}
	case AlertStateAlerting:
		return &StateDescription{
			Color: "#D63232",
			Text:  "Alerting",
		}
	case AlertStateUnknown:
		return &StateDescription{
			Color: "#888888",
			Text:  "Unknown",
		}
	default:
		panic("Unknown rule state for alert " + c.Rule.State)
	}
}

// GetDurationMs returns the duration of the alert evaluation.
func (c *EvalContext) GetDurationMs() float64 {
	return float64(c.EndTime.Nanosecond()-c.StartTime.Nanosecond()) / float64(1000000)
}

// GetNotificationTitle returns the title of the alert rule including alert state.
func (c *EvalContext) GetNotificationTitle() string {
	return "[" + c.GetStateModel().Text + "] " + c.Rule.Name
}

// GetDashboardUID returns the dashboard uid for the alert rule.
func (c *EvalContext) GetDashboardUID() (*DashboardRef, error) {
	if c.dashboardRef != nil {
		return c.dashboardRef, nil
	}

	dash, err := QueryDashboard(c.Rule.DashboardID)
	if err != nil {
		return nil, err
	}

	dash.UpdateSlug()
	c.dashboardRef = &DashboardRef{dash.Uid, dash.Slug}

	return c.dashboardRef, nil
}

const urlFormat = "%s?tab=alert&editPanel=%d"

// GetRuleURL returns the url to the dashboard containing the alert.
func (c *EvalContext) GetRuleURL() (string, error) {
	if c.IsTestRun {
		return config.Data.Common.UIRootURL, nil
	}

	ref, err := c.GetDashboardUID()
	if err != nil {
		return "", err
	}
	return fmt.Sprintf(urlFormat, GetFullDashboardUrl(ref.Uid, ref.Slug), c.Rule.PanelID), nil
}

// GetNewState returns the new state from the alert rule evaluation.
func (c *EvalContext) GetNewState() AlertStateType {
	ns := getNewStateInternal(c)
	if ns != AlertStateAlerting || c.Rule.For == 0 {
		return ns
	}

	since := time.Since(c.Rule.LastStateChange)
	if c.PrevAlertState == AlertStatePending && since > c.Rule.For {
		return AlertStateAlerting
	}

	if c.PrevAlertState == AlertStateAlerting {
		return AlertStateAlerting
	}

	return AlertStatePending
}

func (c *EvalContext) ShouldUpdateAlertState() bool {
	return c.Rule.State != c.PrevAlertState
}

func (c *EvalContext) ShouldNotify() bool {
	if c.PrevAlertState == AlertStateUnknown && c.Rule.State == AlertStateOK {
		return false
	}

	return c.Rule.State != c.PrevAlertState
}

func getNewStateInternal(c *EvalContext) AlertStateType {
	if c.Error != nil {

		c.log.Error("Alert Rule Result Error",
			"ruleId", c.Rule.ID,
			"name", c.Rule.Name,
			"error", c.Error,
			"changing state to", c.Rule.ExecutionErrorState.ToAlertState())

		if c.Rule.ExecutionErrorState == ExecutionErrorKeepState {
			return c.PrevAlertState
		}
		return c.Rule.ExecutionErrorState.ToAlertState()
	}

	if c.Firing {
		return AlertStateAlerting
	}

	if c.NoDataFound {
		c.log.Info("Alert Rule returned no data",
			"ruleId", c.Rule.ID,
			"name", c.Rule.Name,
			"changing state to", c.Rule.NoDataState.ToAlertState())

		if c.Rule.NoDataState == NoDataKeepState {
			return c.PrevAlertState
		}
		return c.Rule.NoDataState.ToAlertState()
	}

	return AlertStateOK
}
