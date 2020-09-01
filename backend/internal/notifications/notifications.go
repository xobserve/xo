package notifications

import (
	"github.com/datadefeat/datav/backend/pkg/config"
	"github.com/datadefeat/datav/backend/pkg/models"
	"github.com/datadefeat/datav/backend/pkg/log"
	"bytes"
	"html/template"
	"fmt"
	"github.com/jordan-wright/email"
)

var logger = log.RootLogger.New("logger", "notifications")

var mailTemplates *template.Template

func init() {
	mailTemplates = template.New("name") 
	tmpl, err := template.ParseGlob("./templates/*.tmpl")
    if err != nil {
        logger.Crit("parse email template failed","error", err)
        panic(err)
	}
	
	mailTemplates = tmpl
}

func SendEmail(content *models.EmailContent) error {
	if (!config.Data.SMTP.Enabled) {
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

	for _,msg := range messages {
		e := email.NewEmail()
		e.From = msg.From
		e.To = msg.To
		e.Subject = msg.Subject
		e.HTML = []byte(msg.Body)
		err = e.Send(config.Data.SMTP.Host,nil)
		if err != nil {
			logger.Warn("send email error", "error",err)
		}
	}

	return nil
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
	if err !=nil {
		return nil, err
	}

	if content.Subject == "" {
		content.Subject = "Subject is missing"
	}

	return &EmailMessage {
		To: content.To,
		SingleEmail: content.SingleEmail,
		From:    fmt.Sprintf("%s <%s>", config.Data.SMTP.FromName, config.Data.SMTP.FromAddress),
		Subject: content.Subject,
		Body: buffer.String(),
		EmbededFiles: content.EmbededFiles,
		AttachedFiles: content.AttachedFiles,
	}, nil
}