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
	"database/sql"
	"net/http"

	"github.com/DataObserve/datav/backend/internal/user"
	"github.com/DataObserve/datav/backend/internal/variables"
	"github.com/DataObserve/datav/backend/pkg/common"
	"github.com/DataObserve/datav/backend/pkg/config"
	"github.com/DataObserve/datav/backend/pkg/e"
	"github.com/DataObserve/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

type UIConfig struct {
	AppName       string `json:"appName"`
	RepoUrl       string `json:"repoUrl"`
	Panel         Panel  `json:"panel"`
	ShowAlertIcon bool   `json:"showAlertIcon"`

	EnableGithubLogin bool   `json:"enableGithubLogin"`
	GithubOAuthToken  string `json:"githubOAuthToken"`

	Sidemenu *models.SideMenu `json:"sidemenu"`
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
		AppName:           config.Data.Common.AppName,
		RepoUrl:           config.Data.Common.RepoUrl,
		Panel:             panel,
		ShowAlertIcon:     config.Data.Sidemenu.ShowAlertIcon,
		EnableGithubLogin: config.Data.User.EnableGithubLogin,
		GithubOAuthToken:  config.Data.User.GithubOAuthToken,
	}

	// query sidemenu
	u := user.CurrentUser(c)
	var sidemenuId int64
	if u != nil {
		sidemenuId = u.SideMenu
	} else {
		sidemenuId = models.GlobalTeamId
	}
	menu, err := models.QuerySideMenu(sidemenuId, 0)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("query sidemenu error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError(err.Error()))
			return
		}
	}

	cfg.Sidemenu = menu

	vars, err := variables.GetVariables()
	if err != nil {
		logger.Warn("query variables error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(map[string]interface{}{
		"config": cfg,
		"vars":   vars,
	}))
}
