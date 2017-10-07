package messager

import (
	"github.com/teamsaas/meq/common"
	"github.com/teamsaas/sdks"
	"go.uber.org/zap"
)

func Start() {
	sdks.Logger.Info("aaa", zap.String("conf", common.Conf.Common.LogPath))
}
