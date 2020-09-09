package notifiers

import (
	"github.com/CodeCreatively/datav/backend/pkg/config"
	"github.com/CodeCreatively/datav/backend/internal/notifications"
	"fmt"
	"github.com/CodeCreatively/datav/backend/pkg/models"
	"errors"
	"strings"
	"strconv"
)

const EmailType = "email"

func init() {
	RegisterNotifier(EmailType,NewEmailNotifier)
}

type EmailNotifier struct {
	models.AlertNotification
	Addresses []string 
} 

func NewEmailNotifier(model *models.AlertNotification) (Notifier, error) {
	addressesString := model.Settings.Get("addresses").MustString()
	if addressesString == "" {
		return nil, errors.New("Could not find addresses in settings")
	}

	// split addresses with a few different ways
	addresses := splitEmails(addressesString)

	fmt.Println("email notifier:",addresses)
	return &EmailNotifier{
		*model,
		addresses,
	}, nil
}

func (e *EmailNotifier) GetType() string {
	return e.Type
}

func (e *EmailNotifier) Notify(content *AlertContent) error {
	err := notifications.SendEmail(&models.EmailContent{
		Subject: content.GetNotificationTitle(),
		Data: map[string]interface{}{
			"Title":         content.GetNotificationTitle(),
			"State":         content.State,
			"Name":        	 content.Name,
			"StateModel":    content.GetStateModel(),
			"Message":       content.Message,
			"Error":         content.Error.Error(),
			"ImageURL":     content.ImageURL,
			"EmbeddedImage": "",
			"AlertPageUrl":  config.Data.Common.UIRootURL + "/team/rules/" + strconv.FormatInt(e.TeamId,10),
			"Metrics":     content.Metrics,
		},
		To: e.Addresses,
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