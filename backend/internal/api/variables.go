package api

import (
	"github.com/ai-apm/aiapm/backend/internal/variables"
	"github.com/ai-apm/aiapm/backend/pkg/common"
	"github.com/ai-apm/aiapm/backend/pkg/e"
	"github.com/gin-gonic/gin"
)

func GetVariables(c *gin.Context) {
	vars, err := variables.GetVariables()
	if err != nil {
		logger.Warn("query variables error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(200, common.RespSuccess(vars))
}
