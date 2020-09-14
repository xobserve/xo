package notifiers

import (
	"errors"
	"strconv"
	"strings"

	"github.com/code-creatively/datav/backend/internal/alerting"
	"github.com/code-creatively/datav/backend/internal/notifications"
	"github.com/code-creatively/datav/backend/pkg/config"
	"github.com/code-creatively/datav/backend/pkg/models"
)

const EmailType = "email"

func init() {
	alerting.RegisterNotifier(&alerting.NotifierPlugin{
		Type:        "email",
		Name:        "Email",
		Description: "Sends notifications using Grafana server configured SMTP settings",
		Factory:     NewEmailNotifier,
	})
}

type EmailNotifier struct {
	NotifierBase
	Addresses []string
}

func NewEmailNotifier(model *models.AlertNotification) (alerting.Notifier, error) {
	addressesString := model.Settings.Get("addresses").MustString()
	if addressesString == "" {
		return nil, errors.New("Could not find addresses in settings")
	}

	// split addresses with a few different ways
	addresses := splitEmails(addressesString)

	return &EmailNotifier{
		NotifierBase: NewNotifierBase(model),
		Addresses:    addresses,
	}, nil
}

func (e *EmailNotifier) GetType() string {
	return e.Type
}

func (e *EmailNotifier) Notify(evalContext *models.EvalContext) error {
	err0 := ""
	if evalContext.Error != nil {
		err0 = evalContext.Error.Error()
	}

	err := notifications.SendEmail(&models.EmailContent{
		Subject: evalContext.GetNotificationTitle(),
		Data: map[string]interface{}{
			"Title":         evalContext.GetNotificationTitle(),
			"State":         evalContext.Rule.State,
			"Name":          evalContext.Rule.Name,
			"StateModel":    evalContext.GetStateModel(),
			"Message":       evalContext.Rule.Message,
			"Error":         err0,
			"ImageURL":      "",
			"EmbeddedImage": "",
			"AlertPageUrl":  config.Data.Common.UIRootURL + "/team/rules/" + strconv.FormatInt(evalContext.Rule.TeamID, 10),
			"Metrics":       evalContext.EvalMatches,
		},
		To:       e.Addresses,
		Template: "alert_notifaction.tmpl",
	})

	if err != nil {
		logger.Warn("Failed to send alert notification email", "error", err)
		return err
	}

	return nil
}

// splitEmails splits addresses with a few different ways
func splitEmails(emails string) []string {
	return strings.FieldsFunc(emails, func(r rune) bool {
		switch r {
		case ',', ';', '\n':
			return true
		}
		return false
	})
}
