package log

import (
	"github.com/go-stack/stack"
	log "github.com/inconshreveable/log15"
)

var RootLogger = log.New()

func InitLogger(level string) {
	l := log.CallerFileHandler(log.StdoutHandler)
	RootLogger.SetHandler(log.MultiHandler(
		log.LvlFilterHandler(log.LvlInfo, l),
	))
}

func Stack(skip int) string {
	call := stack.Caller(skip)
	s := stack.Trace().TrimBelow(call).TrimRuntime()
	return s.String()
}
