package alerting

import (
	"errors"
	"time"

	"github.com/code-creatively/datav/backend/pkg/models"
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

	GetNotifierID() int64
	GetIsDefault() bool
	GetSendReminder() bool
	GetDisableResolveMessage() bool
	GetFrequency() time.Duration
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

func (n *notificationService) Send(okContext *models.EvalContext, alertContext *models.EvalContext) error {
	notifiers, err := n.getNeededNotifiers(okContext.Rule.Notifications)
	if err != nil {
		logger.Error("Failed to get alert notifiers", "error", err)
		return err
	}

	if len(notifiers) == 0 {
		logger.Debug("zero notifiers configured", "alert_id", okContext.Rule.ID)
		return nil
	}

	err = n.sendNotification(okContext, notifiers)
	if err != nil {
		return err
	}

	return n.sendNotification(alertContext, notifiers)
}

func (n *notificationService) sendNotification(context *models.EvalContext, notifiers []Notifier) error {
	if len(context.EvalMatches) == 0 {
		return nil
	}

	for _, notifier := range notifiers {
		logger.Debug("Sending notification", "type", notifier.GetType(), "id", notifier.GetNotifierID(), "isDefault", notifier.GetIsDefault())

		err := notifier.Notify(context)
		if err != nil {
			logger.Error("failed to send notification", "id", notifier.GetNotifierID(), "error", err)
			return err
		}
	}

	return nil
}

func (n *notificationService) getNeededNotifiers(notificationIds []int64) ([]Notifier, error) {
	nos := models.GetAlertNotificationsByIds(notificationIds)

	notifiers := make([]Notifier, 0)
	for _, notification := range nos {
		not, err := InitNotifier(notification)
		if err != nil {
			logger.Error("Could not create notifier", "notifierType", notification.Type, "error", err)
			continue
		}

		notifiers = append(notifiers, not)
	}

	return notifiers, nil
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
