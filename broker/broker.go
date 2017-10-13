package broker

import (
	"github.com/teamsaas/meq/broker/config"
	"github.com/teamsaas/meq/common/logging"
	"go.uber.org/zap"
)

type Broker struct {
	TcpProvider       *websocket
	WebSocketProvider *WebSocketProvider
}


var bk *Broker

func Start() {
	config.InitConfig()
	logging.InitLogger(config.Conf.Common.LogPath, config.Conf.Common.LogLevel, config.Conf.Common.IsDebug, config.Conf.Common.Service)
	logging.Logger.Info("aaa", zap.String("conf", common.Conf.Common.LogPath))

	gw := &Broker{
		TcpProvider: NewTcpProvider(),
	}

	go gw.TcpProvider.Start()
	go gw.WebSocketProvider.Start()
}
