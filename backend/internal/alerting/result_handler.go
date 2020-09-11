package alerting

import (
	"context"
	"time"

	"github.com/code-creatively/datav/backend/pkg/models"

	"github.com/code-creatively/datav/backend/pkg/utils/simplejson"
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

	if len(evalContext.EvalMatches) > 0 {
		annotationData.Set("evalMatches", simplejson.NewFromAny(evalContext.EvalMatches))
	}

	if evalContext.Error != nil {
		executionError = evalContext.Error.Error()
		annotationData.Set("error", executionError)
	} else if evalContext.NoDataFound {
		annotationData.Set("noData", true)
	}

	if evalContext.ShouldUpdateAlertState() {
		logger.Info("New state change", "ruleId", evalContext.Rule.ID, "newState", evalContext.Rule.State, "prevState", evalContext.PrevAlertState)

		newAlert, err := SetAlertState(evalContext.Rule.ID, evalContext.Rule.State, annotationData, executionError)
		if err != nil {
			if err == models.ErrCannotChangeStateOnPausedAlert {
				logger.Error("Cannot change state on alert that's paused", "error", err)
				return err
			}

			if err == models.ErrRequiresNewState {
				logger.Info("Alert already updated")
				return nil
			}

			logger.Error("Failed to save state", "error", err)
		} else {

			// StateChanges is used for de duping alert notifications
			// when two servers are raising. This makes sure that the server
			// with the last state change always sends a notification.
			evalContext.Rule.StateChanges = newAlert.StateChanges

			// Update the last state change of the alert rule in memory
			evalContext.Rule.LastStateChange = time.Now()
		}
	}

	if evalContext.ShouldNotify() {
		now := time.Now()
		// save annotation
		ann := models.Annotation{
			DashboardId: evalContext.Rule.DashboardID,
			PanelId:     evalContext.Rule.PanelID,
			AlertId:     evalContext.Rule.ID,
			Text:        string(evalContext.Rule.State),
			NewState:    string(evalContext.Rule.State),
			PrevState:   string(evalContext.PrevAlertState),
			Time:        time.Now().UnixNano() / int64(time.Millisecond),
			Data:        annotationData,
			Created:     now.Unix(),
			Updated:     now.Unix(),
		}

		annotationRepo := models.GetAnnotationRep()
		if err := annotationRepo.Create(&ann); err != nil {
			logger.Error("Failed to save annotation for new alert state", "error", err)
		}

		if err := handler.notifier.SendIfNeeded(evalContext); err != nil {
			if xerrors.Is(err, context.Canceled) {
				logger.Debug("handler.notifier.SendIfNeeded returned context.Canceled")
			} else if xerrors.Is(err, context.DeadlineExceeded) {
				logger.Debug("handler.notifier.SendIfNeeded returned context.DeadlineExceeded")
			} else {
				logger.Error("handler.notifier.SendIfNeeded failed", "err", err)
			}
		}
	}

	return nil
}
