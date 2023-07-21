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
	"time"

	"github.com/MyStarship/starship/backend/internal/admin"
	"github.com/MyStarship/starship/backend/internal/api"
	"github.com/MyStarship/starship/backend/internal/dashboard"
	"github.com/MyStarship/starship/backend/internal/datasource"
	"github.com/MyStarship/starship/backend/internal/proxy"
	"github.com/MyStarship/starship/backend/internal/storage"
	"github.com/MyStarship/starship/backend/internal/teams"
	"github.com/MyStarship/starship/backend/internal/user"
	"github.com/MyStarship/starship/backend/internal/variables"
	"github.com/MyStarship/starship/backend/pkg/common"
	"github.com/MyStarship/starship/backend/pkg/config"
	"github.com/MyStarship/starship/backend/pkg/e"
	"github.com/MyStarship/starship/backend/pkg/log"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

type Server struct {
	closeCh chan int
	srv     *http.Server
}

// New ...
func New() *Server {
	return &Server{
		closeCh: make(chan int),
	}
}

var logger = log.RootLogger.New("logger", "server")

// Start ...1=
func (s *Server) Start() error {
	err := storage.Init()
	if err != nil {
		return err
	}

	gin.SetMode((gin.ReleaseMode))

	err = user.Init()
	if err != nil {
		logger.Crit("初始化用户模块失败", "error", err)
	}

	go dashboard.InitHistory()

	go func() {
		router := gin.New()
		router.Use(Cors())

		r := router.Group("/api")

		// global config
		r.GET("/config/ui", getUIConfig)

		// user apis
		r.POST("/login", user.Login)
		r.POST("/logout", user.Logout)
		r.GET("/user/session", user.GetSession)
		r.POST("/account/password", IsLogin(), user.UpdateUserPassword)
		r.POST("/account/info", IsLogin(), user.UpdateUserInfo)

		// teams apis
		r.GET("/teams/all", IsLogin(), teams.GetTeams)
		r.GET("/team/:id", IsLogin(), teams.GetTeam)
		r.GET("/team/:id/members", IsLogin(), teams.GetTeamMembers)
		r.POST("/team/member", IsLogin(), teams.UpdateTeamMember)
		r.POST("/team/add/member", IsLogin(), teams.AddTeamMembers)
		r.DELETE("/team/member/:teamId/:memberId", IsLogin(), teams.DeleteTeamMember)
		r.POST("/team/update", IsLogin(), teams.UpdateTeam)
		r.POST("/team/new", IsLogin(), admin.AddNewTeam)
		r.DELETE("/team/:id", IsLogin(), teams.DeleteTeam)
		r.DELETE("/team/leave/:id", IsLogin(), teams.LeaveTeam)
		r.GET("/team/sidemenu/:id", IsLogin(), teams.GetSideMenu)
		r.POST("/team/sidemenu", IsLogin(), teams.UpdateSideMenu)
		r.GET("/team/sidemenus/forUser", IsLogin(), teams.GetAvailableSidMenusForUser)
		r.POST("/team/sidemenu/select/:teamId", IsLogin(), teams.SelectSideMenuForUser)
		r.GET("/team/sidemenu/current", IsLogin(), teams.GetCurrentSidemenu)
		// variable apis
		r.POST("/variable/new", IsLogin(), variables.AddNewVariable)
		r.GET("/variable/all", IsLogin(), api.GetVariables)
		r.POST("/variable/update", IsLogin(), variables.UpdateVariable)
		r.DELETE("/variable/:id", IsLogin(), variables.DeleteVariable)

		// dashboard apis
		r.GET("/dashboard/byId/:id", IsLogin(), dashboard.GetDashboard)
		r.POST("/dashboard/save", IsLogin(), dashboard.SaveDashboard)
		r.GET("/dashboard/team/:id", IsLogin(), dashboard.GetTeamDashboards)
		r.GET("/dashboard/history/:id", IsLogin(), dashboard.GetHistory)

		// admin apis
		r.GET("/admin/users", IsLogin(), admin.GetUsers)
		r.POST("/admin/user", IsLogin(), admin.UpdateUser)
		r.POST("/admin/user/password", IsLogin(), admin.UpdateUserPassword)
		r.POST("/admin/user/new", IsLogin(), admin.AddNewUser)
		r.POST("/admin/user/role", IsLogin(), admin.UpdateUserRole)
		r.DELETE("/admin/user/:id", IsLogin(), admin.DeleteUser)

		// datasource apis
		r.POST("/datasource/save", IsLogin(), datasource.SaveDatasource)
		r.GET("/datasource/all", datasource.GetDatasources)
		r.DELETE("/datasource/:id", IsLogin(), datasource.DeleteDatasource)

		// proxy apis
		r.Any("/proxy/:id/*path", proxy.ProxyDatasource)
		r.Any("/proxy/:id", proxy.ProxyDatasource)
		r.GET("/proxy", proxy.Proxy)

		r.Use(gzip.Gzip(gzip.DefaultCompression))

		s.srv = &http.Server{
			Addr:    config.Data.Server.Addr,
			Handler: router,
		}

		err := s.srv.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			logger.Crit("start backend server error", "error", err)
			panic(err)
		}
	}()
	return nil
}

// Close ...
func (s *Server) Close() error {
	var waited time.Duration
	if config.Data.Common.IsProd {
		waited = 5 * time.Second
	} else {
		waited = 1 * time.Second
	}
	close(s.closeCh)

	time.Sleep(waited)
	return nil
}

// Cors is a gin middleware for cross domain.
func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method

		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Content-Type,AccessToken,X-CSRF-Token, Authorization,X-Token,*")
		c.Header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")

		//放行所有OPTIONS方法
		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
		}

		// 处理请求
		c.Next()
	}
}

// 判断用户是否登录
func IsLogin() gin.HandlerFunc {
	time.Sleep(200 * time.Millisecond)
	return func(c *gin.Context) {
		logined := user.IsLogin(c)
		if !logined {
			c.JSON(http.StatusNotAcceptable, common.RespError(e.NoPermission))
			c.Abort()
			return
		}
		c.Next()
	}
}

// 要求用户必须登录才能继续操作
func NeedLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		logined := user.IsLogin(c)
		if !logined {
			c.JSON(http.StatusUnauthorized, common.RespError(e.NeedLogin))
			c.Abort()
			return
		}
		c.Next()
	}
}

func IsProd() gin.HandlerFunc {
	return func(c *gin.Context) {
		if config.Data.Common.IsProd {
			c.JSON(http.StatusForbidden, common.RespError("测试数据生成功能只能在非生产模式下使用"))
			c.Abort()
			return
		}
		c.Next()
	}
}
