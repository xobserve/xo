package alerting

import (
	"context"
	"errors"
	"time"

	"github.com/CodeCreatively/datav/backend/pkg/models"
)

// NotifierPlugin holds meta information about a notifier.
type NotifierPlugin struct {
	Type            string           `json:"type"`
	Name            string           `json:"name"`
	Heading         string           `json:"heading"`
	Description     string           `json:"description"`
	Info            string           `json:"info"`
	OptionsTemplate string           `json:"optionsTemplate"`
	Factory         NotifierFactory  `json:"-"`
	Options         []NotifierOption `json:"options"`
}

// NotifierOption holds information about options specific for the NotifierPlugin.
type NotifierOption struct {
	Element        ElementType    `json:"element"`
	InputType      InputType      `json:"inputType"`
	Label          string         `json:"label"`
	Description    string         `json:"description"`
	Placeholder    string         `json:"placeholder"`
	PropertyName   string         `json:"propertyName"`
	SelectOptions  []SelectOption `json:"selectOptions"`
	ShowWhen       ShowWhen       `json:"showWhen"`
	Required       bool           `json:"required"`
	ValidationRule string         `json:"validationRule"`
}

// Notifier is responsible for sending alert notifications.
type Notifier interface {
	Notify(evalContext *models.EvalContext) error
	GetType() string
	NeedsImage() bool

	// ShouldNotify checks this evaluation should send an alert notification
	ShouldNotify(ctx context.Context, evalContext *models.EvalContext, notificationState *models.AlertNotificationState) bool

	GetNotifierID() string
	GetIsDefault() bool
	GetSendReminder() bool
	GetDisableResolveMessage() bool
	GetFrequency() time.Duration
}

type notifierState struct {
	notifier Notifier
	state    *models.AlertNotificationState
}

type notifierStateSlice []*notifierState

func (notifiers notifierStateSlice) ShouldUploadImage() bool {
	for _, ns := range notifiers {
		if ns.notifier.NeedsImage() {
			return true
		}
	}

	return false
}

// InputType is the type of input that can be rendered in the frontend.
type InputType string

const (
	// InputTypeText will render a text field in the frontend
	InputTypeText = "text"
	// InputTypePassword will render a text field in the frontend
	InputTypePassword = "password"
)

// ElementType is the type of element that can be rendered in the frontend.
type ElementType string

const (
	// ElementTypeInput will render an input
	ElementTypeInput = "input"
	// ElementTypeSelect will render a select
	ElementTypeSelect = "select"
	// ElementTypeSwitch will render a switch
	ElementTypeSwitch = "switch"
	// ElementTypeTextArea will render a textarea
	ElementTypeTextArea = "textarea"
)

// SelectOption is a simple type for Options that have dropdown options. Should be used when Element is ElementTypeSelect.
type SelectOption struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// ShowWhen holds information about when options are dependant on other options.
type ShowWhen struct {
	Field string `json:"field"`
	Is    string `json:"is"`
}

func newNotificationService() *notificationService {
	return &notificationService{}
}

type notificationService struct {
}

func (n *notificationService) SendIfNeeded(evalCtx *models.EvalContext) error {
	notifierStates, err := n.getNeededNotifiers(evalCtx.Rule.Notifications, evalCtx)
	if err != nil {
		logger.Error("Failed to get alert notifiers", "error", err)
		return err
	}

	if len(notifierStates) == 0 {
		return nil
	}

	return n.sendNotifications(evalCtx, notifierStates)
}

func (n *notificationService) sendAndMarkAsComplete(evalContext *models.EvalContext, notifierState *notifierState) error {
	notifier := notifierState.notifier

	logger.Debug("Sending notification", "type", notifier.GetType(), "id", notifier.GetNotifierID(), "isDefault", notifier.GetIsDefault())

	err := notifier.Notify(evalContext)
	if err != nil {
		logger.Error("failed to send notification", "id", notifier.GetNotifierID(), "error", err)
		return err
	}

	if evalContext.IsTestRun {
		return nil
	}

	err = models.SetAlertNotificationStateToComplete(notifierState.state.Id, notifierState.state.Version)
	if err != nil {
		logger.Error("set state to complete error", "error", err)
		return err
	}

	return nil
}

func (n *notificationService) sendNotification(evalContext *models.EvalContext, notifierState *notifierState) error {
	if !evalContext.IsTestRun {
		newVer, err := models.SetAlertNotificationStateToPendingCommand(notifierState.state.Id, notifierState.state.Version, evalContext.Rule.StateChanges)
		if err == models.ErrAlertNotificationStateVersionConflict {
			return nil
		}

		if err != nil {
			return err
		}

		// We need to update state version to be able to log
		// unexpected version conflicts when marking notifications as ok
		notifierState.state.Version = newVer
	}

	return n.sendAndMarkAsComplete(evalContext, notifierState)
}

func (n *notificationService) sendNotifications(evalContext *models.EvalContext, notifierStates notifierStateSlice) error {
	for _, notifierState := range notifierStates {
		err := n.sendNotification(evalContext, notifierState)
		if err != nil {
			logger.Error("failed to send notification", "id", notifierState.notifier.GetNotifierID(), "error", err)
			if evalContext.IsTestRun {
				return err
			}
		}
	}
	return nil
}

func (n *notificationService) getNeededNotifiers(notificationIds []int64, evalContext *models.EvalContext) (notifierStateSlice, error) {
	nos := models.GetAlertNotificationsByIds(notificationIds)

	var result notifierStateSlice
	for _, notification := range nos {
		not, err := InitNotifier(notification)
		if err != nil {
			logger.Error("Could not create notifier", "notifierType", notification.Type, "error", err)
			continue
		}

		ans, err := models.GetOrCreateAlertNotificationState(notification.Id, evalContext.Rule.ID)
		if err != nil {
			logger.Error("Could not get notification state.", "notifier", notification.Id, "error", err)
			continue
		}

		if not.ShouldNotify(evalContext.Ctx, evalContext, ans) {
			result = append(result, &notifierState{
				notifier: not,
				state:    ans,
			})
		}
	}

	return result, nil
}

// InitNotifier instantiate a new notifier based on the model.
func InitNotifier(model *models.AlertNotification) (Notifier, error) {
	notifierPlugin, found := notifierFactories[model.Type]
	if !found {
		return nil, errors.New("Unsupported notification type")
	}

	return notifierPlugin.Factory(model)
}

// NotifierFactory is a signature for creating notifiers.
type NotifierFactory func(notification *models.AlertNotification) (Notifier, error)

var notifierFactories = make(map[string]*NotifierPlugin)

// RegisterNotifier register an notifier
func RegisterNotifier(plugin *NotifierPlugin) {
	notifierFactories[plugin.Type] = plugin
}

// GetNotifiers returns a list of metadata about available notifiers.
func GetNotifiers() []*NotifierPlugin {
	list := make([]*NotifierPlugin, 0)

	for _, value := range notifierFactories {
		list = append(list, value)
	}

	return list
}
