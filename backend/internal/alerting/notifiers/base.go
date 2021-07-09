package notifiers

import (
	"time"

	"github.com/datav-io/datav/backend/pkg/utils/simplejson"

	"github.com/datav-io/datav/backend/pkg/log"
	"github.com/datav-io/datav/backend/pkg/models"
)

var logger = log.RootLogger.New("logger", "alerting/notifiers")

const (
	triggMetrString = "Triggered metrics:\n\n"
)

// NotifierBase is the base implementation of a notifier.
type NotifierBase struct {
	Name                  string
	Type                  string
	ID                    int64
	IsDefault             bool
	UploadImage           bool
	SendReminder          bool
	DisableResolveMessage bool
	Frequency             time.Duration
	Settings              *simplejson.Json
}

// NewNotifierBase returns a new `NotifierBase`.
func NewNotifierBase(model *models.AlertNotification) NotifierBase {
	uploadImage := true
	value, exist := model.Settings.CheckGet("uploadImage")
	if exist {
		uploadImage = value.MustBool()
	}

	return NotifierBase{
		ID:                    model.Id,
		Name:                  model.Name,
		IsDefault:             model.IsDefault,
		Type:                  model.Type,
		UploadImage:           uploadImage,
		SendReminder:          model.SendReminder,
		DisableResolveMessage: model.DisableResolveMessage,
		Frequency:             model.Frequency,
		Settings:              model.Settings,
	}
}

// GetType returns the notifier type.
func (n *NotifierBase) GetType() string {
	return n.Type
}

func (n *NotifierBase) GetSettings() *simplejson.Json {
	return n.Settings
}

// NeedsImage returns true if an image is expected in the notification.
func (n *NotifierBase) NeedsImage() bool {
	return n.UploadImage
}

// GetNotifierUID returns the notifier `uid`.
func (n *NotifierBase) GetNotifierID() int64 {
	return n.ID
}

// GetIsDefault returns true if the notifiers should
// be used for all alerts.
func (n *NotifierBase) GetIsDefault() bool {
	return n.IsDefault
}

// GetSendReminder returns true if reminders should be sent.
func (n *NotifierBase) GetSendReminder() bool {
	return n.SendReminder
}

// GetDisableResolveMessage returns true if ok alert notifications
// should be skipped.
func (n *NotifierBase) GetDisableResolveMessage() bool {
	return n.DisableResolveMessage
}

// GetFrequency returns the frequency for how often
// alerts should be evaluated.
func (n *NotifierBase) GetFrequency() time.Duration {
	return n.Frequency
}
