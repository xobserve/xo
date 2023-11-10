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
	"context"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/admin"
	"github.com/xObserve/xObserve/query/internal/annotation"
	"github.com/xObserve/xObserve/query/internal/api"
	"github.com/xObserve/xObserve/query/internal/cache"
	"github.com/xObserve/xObserve/query/internal/dashboard"
	"github.com/xObserve/xObserve/query/internal/datasource"
	ot "github.com/xObserve/xObserve/query/internal/opentelemetry"
	_ "github.com/xObserve/xObserve/query/internal/plugins/builtin"
	_ "github.com/xObserve/xObserve/query/internal/plugins/external"
	"github.com/xObserve/xObserve/query/internal/proxy"
	"github.com/xObserve/xObserve/query/internal/storage"
	"github.com/xObserve/xObserve/query/internal/task"
	"github.com/xObserve/xObserve/query/internal/teams"
	"github.com/xObserve/xObserve/query/internal/tenant"
	"github.com/xObserve/xObserve/query/internal/user"
	"github.com/xObserve/xObserve/query/internal/variables"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/config"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/log"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"go.uber.org/zap"
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

var logger = colorlog.RootLogger.New()

// Start ...1=
func (s *Server) Start() error {
	ot.InitOpentelemetry()

	log.L = log.L.With(zap.String("service", config.Data.Common.AppName))

	err := storage.Init(ot.TraceProvider)
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
	go cache.Init()
	go overrideApiServerAddrInLocalUI()

	go func() {
		router := gin.New()
		router.Use(Cors())

		r := router.Group("/api")
		r.Use(gzip.Gzip(gzip.DefaultCompression))

		otelPlugin := otelgin.Middleware(config.Data.Common.AppName)
		// r.Use(otelPlugin)
		// global config
		r.GET("/config/ui", getUIConfig)

		// user apis
		r.POST("/login", user.Login)
		r.POST("/login/github", user.LoginGithub)
		r.POST("/logout", user.Logout)
		r.GET("/user/session", user.GetSession)
		r.POST("/account/password", CheckLogin(), user.UpdateUserPassword)
		r.POST("/account/info", CheckLogin(), user.UpdateUserInfo)
		r.POST("/account/updateData", CheckLogin(), user.UpdateUserData)

		// teams apis
		r.GET("/teams/all", otelPlugin, teams.GetTeams)
		r.GET("/team/byId/:id", CheckLogin(), teams.GetTeam)
		r.GET("/team/byDashId/:id", CheckLogin(), teams.GetTeamByDashId)
		r.GET("/team/:id/members", CheckLogin(), teams.GetTeamMembers)
		r.POST("/team/member", MustLogin(), teams.UpdateTeamMember)
		r.POST("/team/add/member", MustLogin(), teams.AddTeamMembers)
		r.DELETE("/team/member/:teamId/:memberId", MustLogin(), teams.DeleteTeamMember)
		r.POST("/team/update", MustLogin(), teams.UpdateTeam)
		r.POST("/team/new", MustLogin(), admin.AddNewTeam)
		r.DELETE("/team/:id", MustLogin(), teams.DeleteTeam)
		r.DELETE("/team/leave/:id", MustLogin(), teams.LeaveTeam)
		r.GET("/team/sidemenu/:id", teams.GetSideMenu)
		r.POST("/team/sidemenu", MustLogin(), teams.UpdateSideMenu)
		r.GET("/team/sidemenus/forUser", CheckLogin(), teams.GetAvailableSidMenusForUser)
		r.POST("/team/sidemenu/select/:teamId", MustLogin(), teams.SelectSideMenuForUser)
		r.GET("/team/sidemenu/current", CheckLogin(), teams.GetCurrentSidemenu)
		r.POST("/team/allowGlobal", MustLogin(), teams.UpdateAllowGlobal)

		// variable apis
		r.POST("/variable/new", MustLogin(), variables.AddNewVariable)
		r.GET("/variable/all", otelPlugin, api.GetVariables)
		r.POST("/variable/update", MustLogin(), variables.UpdateVariable)
		r.DELETE("/variable/:id", MustLogin(), variables.DeleteVariable)

		// dashboard apis
		r.GET("/dashboard/byId/:id", CheckLogin(), otelPlugin, dashboard.GetDashboard)
		r.POST("/dashboard/save", MustLogin(), otelPlugin, dashboard.SaveDashboard)
		r.GET("/dashboard/team/:id", CheckLogin(), dashboard.GetTeamDashboards)
		r.GET("/dashboard/history/:id", CheckLogin(), otelPlugin, dashboard.GetHistory)
		r.GET("/dashboard/simpleList", CheckLogin(), otelPlugin, dashboard.GetSimpleList)
		r.POST("/dashboard/star/:id", MustLogin(), dashboard.Star)
		r.POST("/dashboard/unstar/:id", MustLogin(), dashboard.UnStar)
		r.GET("/dashboard/starred", CheckLogin(), dashboard.GetAllStarred)
		r.GET("/dashboard/starred/:id", CheckLogin(), dashboard.GetStarred)
		r.DELETE("/dashboard/:id", MustLogin(), dashboard.Delete)
		r.POST("/dashboard/weight", MustLogin(), dashboard.UpdateWeight)

		// annotation
		r.POST("/annotation", MustLogin(), annotation.SetAnnotation)
		r.GET("/annotation/:namespace", CheckLogin(), annotation.QueryNamespaceAnnotations)
		r.DELETE("/annotation/:namespace/:id", MustLogin(), annotation.RemoveAnnotation)
		r.DELETE("/annotation/group/:namespace/:group/:expires", MustLogin(), annotation.RemoveGroupAnnotations)

		// admin apis
		r.GET("/admin/users", CheckLogin(), otelPlugin, admin.GetUsers)
		r.POST("/admin/user", MustLogin(), admin.UpdateUser)
		r.POST("/admin/user/password", MustLogin(), admin.UpdateUserPassword)
		r.POST("/admin/user/new", MustLogin(), admin.AddNewUser)
		r.POST("/admin/user/role", MustLogin(), admin.UpdateUserRole)
		r.DELETE("/admin/user/:id", MustLogin(), admin.DeleteUser)
		r.GET("/admin/auditlogs", CheckLogin(), admin.QueryAuditLogs)
		// datasource apis
		r.POST("/datasource/save", MustLogin(), datasource.SaveDatasource)
		r.GET("/datasource/all", otelPlugin, datasource.GetDatasources)
		r.DELETE("/datasource/:id", MustLogin(), datasource.DeleteDatasource)

		// tenant apis
		r.GET("/tenant/list/all", MustLogin(), tenant.QueryTenants)
		r.POST("/tenant/create", MustLogin(), tenant.CreateTenant)

		r.GET("/datasource/test", proxy.TestDatasource)
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
		logger.Info("xobserve server is ready and listening on", "address", config.Data.Server.ListeningAddr)
		err := s.srv.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			logger.Crit("start query service error", "error", err)
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

	// 	logger.Info("xobserve's ui server is listening on address", "address", config.Data.Server.UIAddr)

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

// APIs can be accessed by anonymous users when the configuration is set
// When disabled, unauthorized users will be rediret to login page
func CheckLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		if config.Data.User.AllowAnonymous {
			c.Next()
			return
		}

		logined := user.IsLogin(c)
		if !logined {
			c.JSON(http.StatusUnauthorized, common.RespError(e.NoPermission))
			c.Abort()
			return
		}
		c.Next()
	}
}

// APIS cannot be accessed by anonymous users, give user a not-login tips
func MustLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		logined := user.IsLogin(c)
		if !logined {
			c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
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
