package messager

import (
	"github.com/teamsaas/meq/common"
	"go.uber.org/zap"
)

func Start() {
	common.Logger.Info("aaa", zap.String("conf", common.Conf.Common.LogPath))
}
