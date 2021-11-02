package notifiers

import (
	"errors"
	"strconv"
	"strings"

	"github.com/savecost/datav/backend/pkg/utils/simplejson"

	"github.com/savecost/datav/backend/internal/alerting"
	"github.com/savecost/datav/backend/internal/notifications"
	"github.com/savecost/datav/backend/pkg/config"
	"github.com/savecost/datav/backend/pkg/models"
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
}

func NewEmailNotifier(model *models.AlertNotification) (alerting.Notifier, error) {
	return &EmailNotifier{
		NotifierBase: NewNotifierBase(model),
	}, nil
}

func (e *EmailNotifier) GetType() string {
	return e.Type
}

func (e *EmailNotifier) Notify(evalContext *models.EvalContext, settings *simplejson.Json) error {
	err0 := ""
	if evalContext.Error != nil {
		err0 = evalContext.Error.Error()
	}

	addressesString := settings.Get("addresses").MustString()
	if addressesString == "" {
		return errors.New("Could not find addresses in settings")
	}

	addresses := splitEmails(addressesString)

	content := &models.EmailContent{
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
			"AlertPageUrl":  config.Data.Server.UIRootURL + "/team/rules/" + strconv.FormatInt(evalContext.Rule.TeamID, 10),
			"Metrics":       evalContext.EvalMatches,
		},
		To:       addresses,
		Template: "alert_notifaction.tmpl",
	}
	err := notifications.SendEmail(content)

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
