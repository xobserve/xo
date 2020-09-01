package models

import (
	"errors"
)

var ErrInvalidEmailCode = errors.New("Invalid or expired email code")
var ErrSmtpNotEnabled = errors.New("SMTP not configured, check your grafana.ini config file's [smtp] section")

// EmailAttachFile is a definition of the attached files without path
type EmailAttachFile struct {
	Name    string
	Content []byte
}

type EmailContent struct {
	To            []string
	SingleEmail   bool
	Template      string
	Subject       string
	Data          map[string]interface{}
	Info          string
	ReplyTo       []string
	EmbededFiles  []string
	AttachedFiles []*EmailAttachFile
}
