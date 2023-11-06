package bodyparser

import "go.opentelemetry.io/collector/pdata/plog"

type Parser interface {
	Parse(body []byte) (plog.Logs, int)
}

func GetBodyParser(source string) Parser {
	switch source {
	// case "google":
	// 	return &GCloud{}
	case "heroku":
		return NewHeroku()
	default:
		return &Default{}
	}
}
