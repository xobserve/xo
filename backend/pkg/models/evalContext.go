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

	// series hash id : alert state
	States          map[string]*AlertState
	PrevAlertStates map[string]*AlertState

	Ctx context.Context
}

// NewEvalContext is the EvalContext constructor.
func NewEvalContext(alertCtx context.Context, rule *Rule, logger log15.Logger, alertStates map[string]*AlertState) *EvalContext {
	return &EvalContext{
		Ctx:             alertCtx,
		StartTime:       time.Now(),
		Rule:            rule,
		Logs:            make([]*ResultLogEntry, 0),
		EvalMatches:     make([]*EvalMatch, 0),
		PrevAlertStates: alertStates,
		log:             logger,
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
func (c *EvalContext) SetNewStates() {
	//@todo: 处理 EvalContext中的error

	now := time.Now()
	for _, match := range c.EvalMatches {
		prevState, ok := c.PrevAlertStates[match.Metric]
		if !ok {
			if match.NoDataFound {
				if c.Rule.NoDataState != NoDataKeepState {
					c.States[match.Metric] = &AlertState{now, AlertStateNoData}
					continue
				}
			}

			if match.Firing && c.Rule.For == 0 {
				// instantly fire
				c.States[match.Metric] = &AlertState{now, AlertStateAlerting}
				continue
			}

			if match.Firing {
				c.States[match.Metric] = &AlertState{now, AlertStatePending}
				continue
			}

			c.States[match.Metric] = &AlertState{now, AlertStateOK}
			continue
		}

		if match.NoDataFound {
			if c.Rule.NoDataState == NoDataKeepState {
				c.States[match.Metric] = &AlertState{prevState.LastStateChange, prevState.State}
			} else {
				if prevState.State != AlertStateNoData {
					c.States[match.Metric] = &AlertState{now, AlertStateNoData}
				}
			}
			continue
		}

		if match.Firing && c.Rule.For == 0 {
			if prevState.State != AlertStateAlerting {
				c.States[match.Metric] = &AlertState{now, AlertStateAlerting}
			} else {
				c.States[match.Metric] = &AlertState{prevState.LastStateChange, prevState.State}
			}
			continue
		}

		if match.Firing {
			since := time.Since(prevState.LastStateChange)
			if prevState.State == AlertStatePending {
				if since > c.Rule.For {
					c.States[match.Metric] = &AlertState{now, AlertStateAlerting}
				} else {
					c.States[match.Metric] = &AlertState{prevState.LastStateChange, prevState.State}
				}

				continue
			}

			if prevState.State == AlertStateAlerting {
				c.States[match.Metric] = &AlertState{prevState.LastStateChange, prevState.State}
				continue
			}

			c.States[match.Metric] = &AlertState{now, AlertStatePending}
		}

		if prevState.State != AlertStateOK {
			c.States[match.Metric] = &AlertState{now, AlertStateOK}
			continue
		}

		c.States[match.Metric] = &AlertState{prevState.LastStateChange, prevState.State}
	}
}

// func (c *EvalContext) ShouldUpdateAlertState() bool {
// 	return c.Rule.State != c.PrevAlertState
// }

// func (c *EvalContext) ShouldNotify() bool {
// 	if c.PrevAlertState == AlertStateUnknown && c.Rule.State == AlertStateOK {
// 		return false
// 	}

// 	return c.Rule.State != c.PrevAlertState
// }
