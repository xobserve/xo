package logger

import (
	"io"
	"log"
	"os"
	"path/filepath"

	flag "github.com/spf13/pflag"

	"github.com/DataObserve/datav/otel-collector/pkg/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var lumberJackLogger *lumberjack.Logger

func newLumberJackLogger(logFile string) *lumberjack.Logger {
	// check is in container
	if logFile != "" && !config.IsRunningInContainer() {
		return &lumberjack.Logger{
			Filename:   logFile,
			MaxSize:    100, // MB
			MaxBackups: 5,   // backup files
			MaxAge:     7,   //days
			Compress:   true,
		}
	}
	return nil
}

func WrapCoreOpt(flagSet *flag.FlagSet) zap.Option {
	return zap.WrapCore(func(c zapcore.Core) zapcore.Core {
		if lumberJackLogger == nil {
			logFile, _ := flagSet.GetString("logpath")
			lumberJackLogger = newLumberJackLogger(logFile)
		}

		return zapcore.NewTee(c, zapcore.NewCore(
			zapcore.NewJSONEncoder(zapcore.EncoderConfig{
				MessageKey:     "message",
				LevelKey:       "level",
				TimeKey:        "timestamp",
				CallerKey:      "caller",
				StacktraceKey:  "stack",
				EncodeLevel:    zapcore.LowercaseLevelEncoder,
				EncodeTime:     zapcore.ISO8601TimeEncoder,
				EncodeDuration: zapcore.SecondsDurationEncoder,
				EncodeCaller:   zapcore.ShortCallerEncoder,
			}),
			zapcore.AddSync(lumberJackLogger),
			c.(zapcore.LevelEnabler),
		))
	})
}

// SetupErrorLogger setup for go logger
func SetupErrorLogger(flagSet *flag.FlagSet) {
	var writer io.WriteCloser
	// when running in container, log to stderr
	if lumberJackLogger != nil {
		logFile, _ := flagSet.GetString("logpath")
		if err := os.MkdirAll(filepath.Dir(logFile), 0755); err != nil {
			log.Printf("Danger! mkdir log file due to : %v\n", err)
		}
		writer = lumberJackLogger
	} else {
		writer = os.Stderr
	}
	log.SetOutput(writer)
}
