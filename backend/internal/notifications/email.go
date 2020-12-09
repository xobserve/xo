package notifications

import (
	"bytes"
	"fmt"
	"html/template"

	"github.com/apm-ai/datav/backend/pkg/config"
	"github.com/apm-ai/datav/backend/pkg/models"
	"github.com/jordan-wright/email"
)

var mailTemplates *template.Template

func init() {
	mailTemplates = template.New("name")
	tmpl, err := template.ParseGlob("./templates/*.tmpl")
	if err != nil {
		logger.Crit("parse email template failed", "error", err)
		panic(err)
	}

	mailTemplates = tmpl
}

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

func SendEmail(content *models.EmailContent) error {
	if !config.Data.SMTP.Enabled {
		return models.ErrSmtpNotEnabled
	}

	msg, err := buildEmail(content)
	if err != nil {
		return err
	}

	messages := []*EmailMessage{}
	for _, address := range msg.To {
		copy := *msg
		copy.To = []string{address}
		messages = append(messages, &copy)
	}

	var err0 error
	for _, msg := range messages {
		e := email.NewEmail()
		e.From = msg.From
		e.To = msg.To
		e.Subject = msg.Subject
		e.HTML = []byte(msg.Body)
		err = e.Send(config.Data.SMTP.Host, nil)
		if err != nil {
			logger.Warn("send email error", "error", err)
			err0 = err
		}
	}

	return err0
}

func buildEmail(content *models.EmailContent) (*EmailMessage, error) {
	var buffer bytes.Buffer
	var err error

	data := content.Data
	if data == nil {
		data = make(map[string]interface{}, 10)
	}

	setDefaultEmailData(data)

	err = mailTemplates.ExecuteTemplate(&buffer, content.Template, data)
	if err != nil {
		return nil, err
	}

	if content.Subject == "" {
		content.Subject = "Subject is missing"
	}

	return &EmailMessage{
		To:            content.To,
		SingleEmail:   content.SingleEmail,
		From:          fmt.Sprintf("%s <%s>", config.Data.SMTP.FromName, config.Data.SMTP.FromAddress),
		Subject:       content.Subject,
		Body:          buffer.String(),
		EmbededFiles:  content.EmbededFiles,
		AttachedFiles: content.AttachedFiles,
	}, nil
}
