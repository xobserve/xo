package notifications

import (
	"github.com/datadefeat/datav/backend/pkg/models"
)



// Message is representation of the email message.
type EmailMessage struct {
	To            []string
	SingleEmail   bool
	From          string
	Subject       string
	Body          string
	Info          string
	ReplyTo       []string
	EmbededFiles  []string
	AttachedFiles []*models.EmailAttachFile
}

func setDefaultEmailData(data map[string]interface{}) {
	// data["AppUrl"] = setting.AppUrl
	// data["BuildVersion"] = setting.BuildVersion
	// data["BuildStamp"] = setting.BuildStamp
	// data["EmailCodeValidHours"] = setting.EmailCodeValidMinutes / 60
	data["Subject"] = map[string]interface{}{}
}
