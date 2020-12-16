package alerting

import (
	"context"
	"time"

	"github.com/opendatav/datav/backend/pkg/models"

	"github.com/opendatav/datav/backend/pkg/utils/simplejson"
	"golang.org/x/xerrors"
)

type resultHandler interface {
	handle(evalContext *models.EvalContext) error
}

type defaultResultHandler struct {
	notifier *notificationService
}

func newResultHandler() *defaultResultHandler {
	return &defaultResultHandler{
		notifier: newNotificationService(),
	}
}

func (handler *defaultResultHandler) handle(evalContext *models.EvalContext) error {
	executionError := ""
	annotationData := simplejson.New()

	shouldNotifyOk := make([]*models.EvalMatch, 0)
	shouldNotifyAlerting := make([]*models.EvalMatch, 0)
	alertState := models.AlertStateOK
	for _, match := range evalContext.EvalMatches {
		state, ok := evalContext.States[match.Metric]
		if !ok {
			continue
		}

		if state.State == models.AlertStateAlerting {
			alertState = models.AlertStateAlerting
		}

		if state.Changed {
			if state.State == models.AlertStateOK {
				shouldNotifyOk = append(shouldNotifyOk, match)
				continue
			}

			if state.State == models.AlertStateAlerting {
				shouldNotifyAlerting = append(shouldNotifyAlerting, match)
				continue
			}
		}
	}

	if len(evalContext.EvalMatches) == 0 {
		annotationData.Set("noData", true)
		// annotationData.Set("evalMatches", simplejson.NewFromAny(evalContext.EvalMatches))
	}

	if evalContext.Error != nil {
		executionError = evalContext.Error.Error()
		annotationData.Set("error", executionError)
	}

	var annState models.AlertStateType

	if len(shouldNotifyOk) != 0 && len(shouldNotifyAlerting) == 0 {
		annState = models.AlertStateOK
	}

	if len(shouldNotifyAlerting) != 0 {
		annState = models.AlertStateAlerting
	}

	if annState != "" {
		now := time.Now()
		// save annotation
		ann := models.Annotation{
			DashboardId: evalContext.Rule.DashboardID,
			PanelId:     evalContext.Rule.PanelID,
			AlertId:     evalContext.Rule.ID,
			Text:        string(annState),
			NewState:    string(annState),
			Time:        time.Now().UnixNano() / int64(time.Millisecond),
			Data:        annotationData,
			Created:     now.Unix(),
			Updated:     now.Unix(),
		}

		annotationRepo := models.GetAnnotationRep()
		if err := annotationRepo.Create(&ann); err != nil {
			logger.Error("Failed to save annotation for new alert state", "error", err)
		}
	}

	// set alert rule state
	if evalContext.Rule.State != alertState {
		models.SetAlertState(evalContext.Rule.ID, alertState, evalContext.Rule.StateChanges+1)
	}

	okContext := &models.EvalContext{
		Error:       evalContext.Error,
		EvalMatches: shouldNotifyOk,
		Rule: &models.Rule{
			ID:             evalContext.Rule.ID,
			DashboardID:    evalContext.Rule.DashboardID,
			PanelID:        evalContext.Rule.PanelID,
			Name:           evalContext.Rule.Name,
			Message:        evalContext.Rule.Message,
			State:          models.AlertStateOK,
			Notifications:  evalContext.Rule.Notifications,
			AlertRuleTags:  evalContext.Rule.AlertRuleTags,
			SendExceptions: evalContext.Rule.SendExceptions,
		},
	}

	alertContext := &models.EvalContext{
		Error:       evalContext.Error,
		EvalMatches: shouldNotifyAlerting,
		Rule: &models.Rule{
			ID:             evalContext.Rule.ID,
			DashboardID:    evalContext.Rule.DashboardID,
			PanelID:        evalContext.Rule.PanelID,
			Name:           evalContext.Rule.Name,
			Message:        evalContext.Rule.Message,
			State:          models.AlertStateAlerting,
			Notifications:  evalContext.Rule.Notifications,
			AlertRuleTags:  evalContext.Rule.AlertRuleTags,
			SendExceptions: evalContext.Rule.SendExceptions,
		},
	}

	// insert alert history
	if len(shouldNotifyOk) > 0 {
		models.AddAlertHistory(okContext)
	}

	if len(shouldNotifyAlerting) > 0 {
		models.AddAlertHistory(alertContext)
	}

	if err := handler.notifier.Send(okContext, alertContext); err != nil {
		if xerrors.Is(err, context.Canceled) {
			logger.Debug("handler.notifier.Send returned context.Canceled")
		} else if xerrors.Is(err, context.DeadlineExceeded) {
			logger.Debug("handler.notifier.Send returned context.DeadlineExceeded")
		} else {
			logger.Error("handler.notifier.Send failed", "err", err)
		}
	}

	return nil
}
