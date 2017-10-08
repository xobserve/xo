package gateway

import (
	"encoding/json"
	"fmt"
	"log"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Logger *zap.Logger

func InitLogger() {
	// logger adderss
	lp := Conf.Common.LogPath
	// logger level DEBUG,ERROR, INFO
	lv := Conf.Common.LogLevel
	// if DEBUG
	isDebug := true
	if Conf.Common.IsDebug != true {
		isDebug = false
	}
	initLogger(lp, lv, isDebug)
	log.SetFlags(log.Lmicroseconds | log.Lshortfile | log.LstdFlags)
}

func initLogger(lp string, lv string, isDebug bool) {
	var js string
	if isDebug {
		js = fmt.Sprintf(`{
		"level": "%s",
		"encoding": "json",
		"outputPaths": ["stdout"],
		"errorOutputPaths": ["stdout"]
		}`, lv)
	} else {
		js = fmt.Sprintf(`{
		"level": "%s",
		"encoding": "json",
		"outputPaths": ["%s"],
		"errorOutputPaths": ["%s"]
		}`, lv, lp, lp)
	}

	var cfg zap.Config
	if err := json.Unmarshal([]byte(js), &cfg); err != nil {
		panic(err)
	}
	cfg.EncoderConfig = zap.NewProductionEncoderConfig()
	cfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	var err error
	Logger, err = cfg.Build()
	if err != nil {
		log.Fatal("init logger error: ", err)
	}
}
