package models

import (
	"time"
	"github.com/datadefeat/datav/backend/pkg/utils/simplejson"
)

type AlertNotification struct {
	Id                    int64            `json:"id"`
	Name                  string           `json:"name"`
	Type                  string           `json:"type"`
	IsDefault             bool             `json:"isDefault"`
	SendReminder          bool             `json:"sendReminder"`
	DisableResolveMessage bool             `json:"disableResolveMessage"`
	UploadImage           bool 			   `json:"uploadImage"`
	Settings              *simplejson.Json `json:"settings"`
	
	CreatedBy             int64            `json:"createdBy"`
	Created               time.Time        `json:"created"`
	Updated               time.Time        `json:"updated"`
}