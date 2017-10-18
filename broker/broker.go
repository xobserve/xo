package broker

import (
	"github.com/teamsaas/meq/broker/config"
	"github.com/teamsaas/meq/common/logging"
	"github.com/teamsaas/meq/common/security"
	"go.uber.org/zap"
)

type Broker struct {
	Tp *TcpProvider
	Hp *HttpProvider

	Ap *Admin

	License  *security.License
	Cipher   *security.Cipher
	Contract *security.SingleContractProvider
}

func Start() {
	config.InitConfig()
	logging.InitLogger(config.Conf.Common.LogPath, config.Conf.Common.LogLevel, config.Conf.Common.IsDebug, config.Conf.Common.Service)

	// check license exists
	if config.Conf.Broker.License == "" {
		logging.Logger.Warn("Please generate license first by calling 'meq gen',then update meq.yaml's broker.license with your license ")
		return
	}

	b := &Broker{
		Tp: NewTcpProvider(),
		Ap: NewAdmin(),
	}

	var err error
	if b.License, err = security.ParseLicense(config.Conf.Broker.License); err != nil {
		logging.Logger.Warn("license parse error: ", zap.Error(err))
		return
	}

	// Create a new cipher from the licence provided
	if b.Cipher, err = b.License.Cipher(); err != nil {
		logging.Logger.Warn("Cipher generate error: ", zap.Error(err))
		return
	}

	b.Contract =
		security.NewSingleContractProvider(b.License)

	broker = b

	go b.Tp.Start()
	go b.Hp.Start()

	// start admin api
	b.Ap.Start()
}
