// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package internal

import (
	"net/http"

	"github.com/DataObserve/datav/backend/pkg/common"
	"github.com/DataObserve/datav/backend/pkg/config"
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
