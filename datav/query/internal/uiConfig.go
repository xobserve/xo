// Copyright 2023 xObserve.io Team
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

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/user"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/config"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
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

	Observability *config.Observability `json:"observability"`
	Tenant        *Tenant               `json:"tenant"`

	// user tenant relative
	CurrentTenant int64           `json:"currentTenant"`
	TenantName    string          `json:"tenantName"`
	CurrentTeam   int64           `json:"currentTeam"`
	TenantRole    models.RoleType `json:"tenantRole"`
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
type Tenant struct {
	Enable bool `json:"enable"`
}

func getUIConfig(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Query("teamId"), 10, 64)
	echarts := Echarts{
		EnableBaiduMap: config.Data.Panel.Echarts.EnableBaiduMap,
		BaiduMapAK:     config.Data.Panel.Echarts.BaiduMapAK,
	}

	panel := Panel{
		Echarts: echarts,
	}

	tenant := Tenant{
		Enable: config.Data.Tenant.Enable,
	}

	cfg := &UIConfig{
		AppName:           config.Data.Common.AppName,
		RepoUrl:           config.Data.Common.RepoUrl,
		Panel:             panel,
		ShowAlertIcon:     config.Data.Sidemenu.ShowAlertIcon,
		EnableGithubLogin: config.Data.User.EnableGithubLogin,
		GithubOAuthToken:  config.Data.User.GithubOAuthToken,
		Plugins:           (*Plugins)(&config.Data.Plugins),
		Observability:     &config.Data.Observability,
		Tenant:            &tenant,
	}

	// query sidemenu
	var tenantId int64
	var err error
	queryTeam := false
	u := user.CurrentUser(c)
	if teamId == 0 {
		if u == nil {
			tenantId = models.DefaultTenantId
		} else {
			tenantId = u.CurrentTenant
		}

		if u != nil {
			teamId = u.CurrentTeam
			teamExist := models.IsTeamExist(c.Request.Context(), teamId)
			if !teamExist {
				queryTeam = true
			}
		} else {
			queryTeam = true
		}
	} else {
		teamExist := models.IsTeamExist(c.Request.Context(), teamId)
		if !teamExist {
			if u != nil {
				tenantId = u.CurrentTenant
				teamId = u.CurrentTeam
				teamExist := models.IsTeamExist(c.Request.Context(), teamId)
				if !teamExist {
					queryTeam = true
				}
			} else {
				tenantId = models.DefaultTenantId
				queryTeam = true
			}
		} else {
			tenantId, err = models.QueryTenantIdByTeamId(c.Request.Context(), teamId)
			if err != nil {
				if err == sql.ErrNoRows {
					c.JSON(400, common.RespError(e.TeamNotExist))
					return
				}
				logger.Warn("query tenant id by team id error", "error", err)
				c.JSON(500, common.RespError(err.Error()))
				return
			}
		}
	}
	if queryTeam {
		teams, err := models.QueryTenantPublicTeamIds(tenantId)
		if err != nil {
			logger.Warn("query tenant public team ids error", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}

		if len(teams) == 0 {
			userInTeams, err := models.QueryTeamsUserIn(c.Request.Context(), u.Id)
			if err != nil {
				logger.Warn("query teams user in error", "error", err)
				c.JSON(500, common.RespError(e.Internal))
				return
			}

			if len(userInTeams) == 0 {
				c.JSON(400, common.RespError("you are not in any team now, please contact admin for help"))
				return
			}

			teamId = userInTeams[0]
			team, err := models.QueryTeam(c.Request.Context(), teamId, "")
			if err != nil {
				if err == sql.ErrNoRows {
					c.JSON(400, common.RespError(e.TeamNotExist))
					return
				}
				logger.Warn("query team error", "error", err)
				c.JSON(500, common.RespError(e.Internal))
				return
			}

			tenantId = team.TenantId
		} else {
			teamId = teams[0]
		}
	}

	if err != nil {
		logger.Warn("get user tenant and team id error", "error", err)
		c.JSON(500, common.RespError(err.Error()))
		return
	}

	menu, err := models.QuerySideMenu(c.Request.Context(), teamId)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("query sidemenu error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError(err.Error()))
			return
		}
	}
	cfg.Sidemenu = menu
	cfg.CurrentTeam = teamId
	cfg.CurrentTenant = tenantId

	// query tenant name
	tenant1, err := models.QueryTenant(c.Request.Context(), tenantId)
	if err != nil {
		logger.Warn("query tenant error", "error", err)
		c.JSON(500, common.RespError(e.Internal))
		return
	}
	cfg.TenantName = tenant1.Name
	if u != nil {
		tenantUser, err := models.QueryTenantUser(c.Request.Context(), tenantId, u.Id)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(400, common.RespError("you are not in this tenant"))
				return
			}
			logger.Warn("query tenant user error", "error", err)
			c.JSON(500, common.RespError(e.Internal))
			return
		}
		cfg.TenantRole = tenantUser.Role
	} else {
		cfg.TenantRole = models.ROLE_GUEST
	}

	c.JSON(http.StatusOK, common.RespSuccess(cfg))
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
