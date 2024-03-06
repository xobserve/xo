package proxy

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/xobserve/xo/query/internal/datasource"
	"github.com/xobserve/xo/query/pkg/common"
	"github.com/xobserve/xo/query/pkg/models"
)

func ProxyXoDatasource(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	dsID, _ := strconv.ParseInt(c.Param("dsId"), 10, 64)
	// dashId := c.Param("dashId")

	// find datasource store url
	//@performance
	ds, err := datasource.GetDatasource(c.Request.Context(), teamId, dsID)
	if err != nil {
		logger.Warn("query datasource error", "error", err)
		c.JSON(500, common.RespError(err.Error()))
		return
	}

	// ak := c.GetString("accessToken")
	// if ak != "" {
	// 	var can bool
	// 	if dashId != "null" {
	// 		can, err = accesstoken.CanViewDashboard(ds.TeamId, dashId, ak)
	// 	} else {
	// 		can, err = accesstoken.CanViewTeam(ds.TeamId, ak)
	// 	}

	// 	if err != nil {
	// 		c.JSON(400, common.RespError(err.Error()))
	// 		return
	// 	}
	// 	if !can {
	// 		c.JSON(403, common.RespError(e.InvalidToken))
	// 		return
	// 	}
	// } else {
	// 	u := c.MustGet("currentUser").(*models.User)

	// 	err = acl.CanViewTeam(c.Request.Context(), ds.TeamId, u.Id)
	// 	if err != nil {
	// 		c.JSON(403, common.RespError(err.Error()))
	// 		return
	// 	}
	// }

	queryPlugin := models.GetPlugin(ds.Type)
	if queryPlugin != nil {
		result := queryPlugin.Query(c, ds)
		if result.Status == models.PluginStatusSuccess {
			c.JSON(http.StatusOK, result)
			return
		} else {
			c.JSON(http.StatusInternalServerError, common.RespError(result.Error))
			return
		}
	}

	c.JSON(http.StatusBadRequest, common.RespError("xo datasource not found"))
}
