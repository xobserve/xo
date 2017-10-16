package broker

import (
	"github.com/teamsaas/meq/broker/config"
	"github.com/teamsaas/meq/common/logging"
	"github.com/teamsaas/meq/broker/protocol/network"
)

type Broker struct {
	Tp  *network.TcpProvider
	Hp *network.HttpProvider
}

var bk *Broker

func Start() {
	config.InitConfig()
	logging.InitLogger(config.Conf.Common.LogPath, config.Conf.Common.LogLevel, config.Conf.Common.IsDebug, config.Conf.Common.Service)

	gw := &Broker{
		Tp:  network.NewTcpProvider(),
	}

	go gw.Tp.Start()
	go gw.Hp.Start()
	select {}
}
