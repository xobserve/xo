package meq

import (
	"os"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func initLogger() *zap.Logger {
	lv := "info"
	var level zapcore.Level

	switch strings.ToLower(lv) {
	case "debug":
		level = zap.DebugLevel
	case "info":
		level = zap.InfoLevel
	case "warn":
		level = zap.WarnLevel
	case "error":
		level = zap.ErrorLevel
	case "fatal":
		level = zap.FatalLevel
	default:
		level = zap.DebugLevel
	}

	atom := zap.NewAtomicLevel()

	// To keep the example deterministic, disable timestamps in the output.
	encoderCfg := zap.NewProductionEncoderConfig()
	encoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder
	l := zap.New(zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderCfg),

		zapcore.Lock(os.Stdout),
		atom,
	), zap.AddCaller())

	atom.SetLevel(level)

	return l
}
