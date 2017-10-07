package sdks

import (
	"encoding/json"
	"log"
	"time"

	"github.com/labstack/echo"

	"fmt"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Logger *zap.Logger

func InitLogger(lp string, lv string, isDebug bool, service string) {
	js := fmt.Sprintf(`{
		"level": "%s",
		"encoding": "json",
		"outputPaths": ["stdout","%s"],
		"errorOutputPaths": ["stderr","%s"]
	}`, lv, lp, lp)

	var cfg zap.Config
	if err := json.Unmarshal([]byte(js), &cfg); err != nil {
		panic(err)
	}
	cfg.EncoderConfig = zap.NewProductionEncoderConfig()
	cfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	cfg.InitialFields = map[string]interface{}{
		"service": service,
	}

	var err error
	Logger, err = cfg.Build()
	if err != nil {
		log.Fatal("init logger error: ", err)
	}

	Logger.Info("logger初始化成功")
}

func DebugLog(requestID string, debugOn bool, msg string, fields ...zapcore.Field) {
	if debugOn {
		Logger.Info(msg, append(fields, zap.String("rid", requestID))...)
	}
}

func LogExtra(c echo.Context) (time.Time, bool) {
	ts := time.Now()

	var debugOn bool
	// 获取debug选项
	if c.FormValue("log_debug") == "on" {
		debugOn = true
	} else {
		debugOn = false
	}

	return ts, debugOn
}
