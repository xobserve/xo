package broker

import (
	"github.com/teamsaas/meq/common/config"
	"github.com/teamsaas/meq/common/logging"
	"go.uber.org/zap"
)

type Broker struct {
}

func Start() {
	L = logging.Logger
	L.Info("aaa", zap.String("conf", config.Conf.Common.LogPath))
}
