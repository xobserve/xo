package broker

import (
	"github.com/teamsaas/meq/broker/config"
	"github.com/teamsaas/meq/common/logging"
)

type Broker struct {
	Tp  *TcpProvider
	Hp *HttpProvider
}

var bk *Broker

func Start() {
	config.InitConfig()
	logging.InitLogger(config.Conf.Common.LogPath, config.Conf.Common.LogLevel, config.Conf.Common.IsDebug, config.Conf.Common.Service)

	gw := &Broker{
		Tp:  NewTcpProvider(),
	}

	go gw.Tp.Start()
	go gw.Hp.Start()
	select {}
}
