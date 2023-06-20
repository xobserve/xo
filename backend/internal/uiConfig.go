package internal

import (
	"net/http"

	"github.com/MyStarship/starship/backend/pkg/common"
	"github.com/MyStarship/starship/backend/pkg/config"
	"github.com/gin-gonic/gin"
)

type UIConfig struct {
	AppName string `json:"appName"`
	RepoUrl string `json:"repoUrl"`
	Panel   Panel  `json:"panel"`
}

type Panel struct {
	Echarts Echarts `json:"echarts"`
}

type Echarts struct {
	EnableBaiduMap bool   `json:"enableBaiduMap"`
	BaiduMapAK     string `json:"baiduMapAK"`
}

func getUIConfig(c *gin.Context) {
	echarts := Echarts{
		EnableBaiduMap: config.Data.Panel.Echarts.EnableBaiduMap,
		BaiduMapAK:     config.Data.Panel.Echarts.BaiduMapAK,
	}

	panel := Panel{
		Echarts: echarts,
	}
	cfg := &UIConfig{
		AppName: config.Data.Common.AppName,
		RepoUrl: config.Data.Common.RepoUrl,
		Panel:   panel,
	}

	c.JSON(http.StatusOK, common.RespSuccess(cfg))
}
