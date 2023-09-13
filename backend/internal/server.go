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
	"context"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/DataObserve/datav/backend/internal/admin"
	"github.com/DataObserve/datav/backend/internal/annotation"
	"github.com/DataObserve/datav/backend/internal/api"
	"github.com/DataObserve/datav/backend/internal/dashboard"
	"github.com/DataObserve/datav/backend/internal/datasource"
	ot "github.com/DataObserve/datav/backend/internal/opentelemetry"
	"github.com/DataObserve/datav/backend/internal/proxy"
	"github.com/DataObserve/datav/backend/internal/storage"
	"github.com/DataObserve/datav/backend/internal/task"
	"github.com/DataObserve/datav/backend/internal/teams"
	"github.com/DataObserve/datav/backend/internal/user"
	"github.com/DataObserve/datav/backend/internal/variables"
	"github.com/DataObserve/datav/backend/pkg/common"
	"github.com/DataObserve/datav/backend/pkg/config"
	"github.com/DataObserve/datav/backend/pkg/e"
	"github.com/DataObserve/datav/backend/pkg/log"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
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

var logger = log.RootLogger.New()

// Start ...1=
func (s *Server) Start() error {
	ot.InitOpentelemetry()

	err := storage.Init()
	if err != nil {
		return err
	}

	gin.SetMode((gin.ReleaseMode))

	err = user.Init()
	if err != nil {
		logger.Crit("init user module failed", "error", err)
	}

	go dashboard.InitHistory()

	go task.Init()

	go overrideApiServerAddrInLocalUI()
	go func() {
		router := gin.New()
		router.Use(Cors())

		r := router.Group("/api")
		r.Use(gzip.Gzip(gzip.DefaultCompression))

		// global config
		r.GET("/config/ui", getUIConfig)

		// user apis
		r.POST("/login", user.Login)
		r.POST("/login/github", user.LoginGithub)
		r.POST("/logout", user.Logout)
		r.GET("/user/session", user.GetSession)
		r.POST("/account/password", IsLogin(), user.UpdateUserPassword)
		r.POST("/account/info", IsLogin(), user.UpdateUserInfo)

		// teams apis
		r.GET("/teams/all", IsLogin(), teams.GetTeams)
		r.GET("/team/byId/:id", IsLogin(), teams.GetTeam)
		r.GET("/team/byDashId/:id", IsLogin(), teams.GetTeamByDashId)
		r.GET("/team/:id/members", IsLogin(), teams.GetTeamMembers)
		r.POST("/team/member", IsLogin(), teams.UpdateTeamMember)
		r.POST("/team/add/member", IsLogin(), teams.AddTeamMembers)
		r.DELETE("/team/member/:teamId/:memberId", IsLogin(), teams.DeleteTeamMember)
		r.POST("/team/update", IsLogin(), teams.UpdateTeam)
		r.POST("/team/new", IsLogin(), admin.AddNewTeam)
		r.DELETE("/team/:id", IsLogin(), teams.DeleteTeam)
		r.DELETE("/team/leave/:id", IsLogin(), teams.LeaveTeam)
		r.GET("/team/sidemenu/:id", teams.GetSideMenu)
		r.POST("/team/sidemenu", IsLogin(), teams.UpdateSideMenu)
		r.GET("/team/sidemenus/forUser", IsLogin(), teams.GetAvailableSidMenusForUser)
		r.POST("/team/sidemenu/select/:teamId", IsLogin(), teams.SelectSideMenuForUser)
		r.GET("/team/sidemenu/current", IsLogin(), teams.GetCurrentSidemenu)

		// variable apis
		r.POST("/variable/new", IsLogin(), variables.AddNewVariable)
		r.GET("/variable/all", api.GetVariables)
		r.POST("/variable/update", IsLogin(), variables.UpdateVariable)
		r.DELETE("/variable/:id", IsLogin(), variables.DeleteVariable)

		// dashboard apis
		r.GET("/dashboard/byId/:id", IsLogin(), otelgin.Middleware(config.Data.Common.AppName), dashboard.GetDashboard)
		r.POST("/dashboard/save", IsLogin(), dashboard.SaveDashboard)
		r.GET("/dashboard/team/:id", IsLogin(), dashboard.GetTeamDashboards)
		r.GET("/dashboard/history/:id", IsLogin(), dashboard.GetHistory)
		r.GET("/dashboard/simpleList", dashboard.GetSimpleList)
		r.POST("/dashboard/star/:id", IsLogin(), dashboard.Star)
		r.POST("/dashboard/unstar/:id", IsLogin(), dashboard.UnStar)
		r.GET("/dashboard/starred", IsLogin(), dashboard.GetAllStarred)
		r.GET("/dashboard/starred/:id", IsLogin(), dashboard.GetStarred)
		r.DELETE("/dashboard/:id", IsLogin(), dashboard.Delete)
		r.POST("/dashboard/weight", IsLogin(), dashboard.UpdateWeight)
		// annotation
		r.POST("/annotation", IsLogin(), annotation.SetAnnotation)
		r.GET("/annotation/:namespace", IsLogin(), annotation.QueryNamespaceAnnotations)
		r.DELETE("/annotation/:namespace/:id", IsLogin(), annotation.RemoveAnnotation)
		r.DELETE("/annotation/group/:namespace/:group/:expires", IsLogin(), annotation.RemoveGroupAnnotations)

		// admin apis
		r.GET("/admin/users", IsLogin(), admin.GetUsers)
		r.POST("/admin/user", IsLogin(), admin.UpdateUser)
		r.POST("/admin/user/password", IsLogin(), admin.UpdateUserPassword)
		r.POST("/admin/user/new", IsLogin(), admin.AddNewUser)
		r.POST("/admin/user/role", IsLogin(), admin.UpdateUserRole)
		r.DELETE("/admin/user/:id", IsLogin(), admin.DeleteUser)
		r.GET("/admin/auditlogs", IsLogin(), admin.QueryAuditLogs)
		// datasource apis
		r.POST("/datasource/save", IsLogin(), datasource.SaveDatasource)
		r.GET("/datasource/all", datasource.GetDatasources)
		r.DELETE("/datasource/:id", IsLogin(), datasource.DeleteDatasource)

		// proxy apis
		r.Any("/proxy/:id/*path", proxy.ProxyDatasource)
		r.Any("/proxy/:id", proxy.ProxyDatasource)
		r.GET("/common/proxy/:panelId", proxy.Proxy)

		// server a directory called static
		// ui static files
		// router.NoRoute(gin.WrapH(http.FileServer(http.Dir("ui"))))
		router.Use(SpaMiddleware("/", "./ui")) // your build of React or other SPA
		// router.Use(static.Serve("/", static.LocalFile("ui", false)))

		s.srv = &http.Server{
			Addr:    config.Data.Server.ListeningAddr,
			Handler: router,
		}
		logger.Info("Datav server is ready and listening on", "address", config.Data.Server.ListeningAddr)
		err := s.srv.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			logger.Crit("start backend server error", "error", err)
			panic(err)
		}
	}()

	// go func() {
	// 	router := mux.NewRouter()

	// 	spa := spaHandler{staticPath: "ui/", indexPath: "index.html"}
	// 	router.PathPrefix("/").Handler(spa)

	// 	srv := &http.Server{
	// 		Handler: router,
	// 		Addr:    config.Data.Server.UIAddr,
	// 		// Good practice: enforce timeouts for servers you create!
	// 		WriteTimeout: 15 * time.Second,
	// 		ReadTimeout:  15 * time.Second,
	// 	}

	// 	logger.Info("Datav's ui server is listening on address", "address", config.Data.Server.UIAddr)

	// 	srv.ListenAndServe()
	// }()

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

	if err := ot.TraceProvider.Shutdown(context.Background()); err != nil {
		logger.Warn("Error shutting down tracer provider: %v", "error", err)
	}

	if err := ot.MeterProvider.Shutdown(context.Background()); err != nil {
		logger.Warn("Error shutting down meter provider: %v", "error", err)
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

// spaHandler implements the http.Handler interface, so we can use it
// to respond to HTTP requests. The path to the static directory and
// path to the index file within that static directory are used to
// serve the SPA in the given static directory.
type spaHandler struct {
	staticPath string
	indexPath  string
}

// ServeHTTP inspects the URL path to locate a file within the static dir
// on the SPA handler. If a file is found, it will be served. If not, the
// file located at the index path on the SPA handler will be served. This
// is suitable behavior for serving an SPA (single page application).
func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// get the absolute path to prevent directory traversal
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		// if we failed to get the absolute path respond with a 400 bad request
		// and stop
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// prepend the path with the path to the static directory
	path = filepath.Join(h.staticPath, path)

	// check whether a file exists at the given path
	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		// file does not exist, serve index.html
		http.ServeFile(w, r, filepath.Join(h.staticPath, h.indexPath))
		return
	} else if err != nil {
		// if we got an error (that wasn't that the file doesn't exist) stating the
		// file, return a 500 internal server error and stop
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// otherwise, use http.FileServer to serve the static dir
	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}

func SpaMiddleware(urlPrefix, spaDirectory string) gin.HandlerFunc {
	directory := static.LocalFile(spaDirectory, true)
	fileserver := http.FileServer(directory)
	if urlPrefix != "" {
		fileserver = http.StripPrefix(urlPrefix, fileserver)
	}

	return func(c *gin.Context) {
		if directory.Exists(urlPrefix, c.Request.URL.Path) {
			fileserver.ServeHTTP(c.Writer, c.Request)
			c.Abort()
		} else {
			c.Request.URL.Path = "/"
			fileserver.ServeHTTP(c.Writer, c.Request)
			c.Abort()
		}
	}
}
