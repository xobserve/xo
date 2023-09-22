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
	"bytes"
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/DataObserve/datav/backend/internal/teams"
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

	Plugins *Plugins `json:"plugins"`
}

type Plugins struct {
	DisablePanels      []string `json:"disablePanels"`
	DisableDatasources []string `json:"disableDatasources"`
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
		Plugins:           (*Plugins)(&config.Data.Plugins),
	}

	// query sidemenu
	u := user.CurrentUser(c)
	var sidemenuId int64 = models.GlobalTeamId
	if u != nil {
		isTeamVisible, err := models.IsTeamVisibleToUser(u.SideMenu, u.Id)
		if err != nil {
			logger.Warn("Error query sidemenu visible ", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError(err.Error()))
			return
		}

		if isTeamVisible {
			sidemenuId = u.SideMenu
		} else {
			teams.SetSideMenuForUser(strconv.FormatInt(models.GlobalTeamId, 10), u.Id)
		}
	}

	menu, err := models.QuerySideMenu(int64(sidemenuId), 0)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("query sidemenu error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError(err.Error()))
			return
		}
	}
	cfg.Sidemenu = menu

	vars, err := variables.GetVariables(0)
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

// overrideApiServerAddrInLocalUI is used to override api server address in local ui automatically
func overrideApiServerAddrInLocalUI() {
	root := config.Data.Server.UiStaticPath
	filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		paths := strings.Split(path, "/")
		if len(paths) >= 1 {
			filename := paths[len(paths)-1]
			// if strings.HasPrefix(filename, "index-") {
			if strings.HasSuffix(filename, ".js") {
				content, err := os.ReadFile(path)
				if err != nil {
					log.Fatal(err.Error() + ":" + filename)
				}

				base := "VITE_API_SERVER_PROD:"
				index := bytes.Index(content, []byte("VITE_API_SERVER_PROD:"))
				if index >= 0 {
					start := index + 22
					var end int
					for i := start + 1; i < len(content); i++ {
						if content[i] == '"' {
							end = i
							break
						}
					}

					var newAddr string

					if strings.TrimSpace(config.Data.Server.OverrideApiServerAddrForUI) != "" {
						newAddr = config.Data.Server.OverrideApiServerAddrForUI
					} else {
						newAddr = "http://" + config.Data.Server.ListeningAddr
					}
					newAddr = fmt.Sprintf(`%s"%s"`, base, newAddr)
					old := fmt.Sprintf(`%s"%s"`, base, string(content[start:end]))
					content = bytes.Replace(content, []byte(old), []byte(newAddr), 1)

					f, err := os.OpenFile(path, os.O_WRONLY|os.O_TRUNC|os.O_CREATE|os.O_SYNC, 0644)
					if err != nil {
						logger.Crit("open ui static file error", "error", err, "path", path)
					} else {
						// offset
						//os.Truncate(filename, 0) //clear
						n, _ := f.Seek(0, io.SeekEnd)
						c, err := f.WriteAt([]byte(content), n)
						if err != nil {
							logger.Crit("write content to ui static file error", "error", err, "path", path, "length", c)
						}
						err = f.Sync()
						if err != nil {
							logger.Crit("sync ui static file error", "error", err, "path", path)
						}
						logger.Info("Successfully override api server address for ui", "path", path, "old_addr", string(old), "new_addr", newAddr)
						defer f.Close()
					}
				}

			}
		}
		// }

		return nil
	})
}
