package broker

import (
	"github.com/teamsaas/meq/broker/config"
	"github.com/teamsaas/meq/common/logging"
	"go.uber.org/zap"
)

type Broker struct {
}

func Start() {
	config.InitConfig()
	logging.InitLogger(config.Conf.Common.LogPath, config.Conf.Common.LogLevel, config.Conf.Common.IsDebug, config.Conf.Common.Service)

	L = logging.Logger
	L.Info("aaa", zap.String("conf", config.Conf.Common.LogPath))
}
