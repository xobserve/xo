package broker

import (
	"github.com/teamsaas/meq/broker/config"
	"github.com/teamsaas/meq/common/logging"
)

type Broker struct {
	Tp *TcpProvider
	Hp *HttpProvider
	Ap *AdminProvider
}

var bk *Broker

func Start() {
	config.InitConfig()
	logging.InitLogger(config.Conf.Common.LogPath, config.Conf.Common.LogLevel, config.Conf.Common.IsDebug, config.Conf.Common.Service)
	gw := &Broker{
		Tp: NewTcpProvider(),
		Ap: NewAdminProvider(),
	}

	go gw.Tp.Start()
	go gw.Hp.Start()

	// start admin api
	gw.Ap.Start()
}
