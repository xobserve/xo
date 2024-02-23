// Copyright 2023 xobserve.io Team
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
	"github.com/xobserve/xo/query/internal/accesstoken"
	"github.com/xobserve/xo/query/internal/admin"
	"github.com/xobserve/xo/query/internal/annotation"
	"github.com/xobserve/xo/query/internal/cache"
	"github.com/xobserve/xo/query/internal/dashboard"
	"github.com/xobserve/xo/query/internal/datasource"
	ot "github.com/xobserve/xo/query/internal/opentelemetry"
	_ "github.com/xobserve/xo/query/internal/plugins/builtin"
	_ "github.com/xobserve/xo/query/internal/plugins/external"
	"github.com/xobserve/xo/query/internal/proxy"
	"github.com/xobserve/xo/query/internal/storage"
	"github.com/xobserve/xo/query/internal/task"
	"github.com/xobserve/xo/query/internal/teams"
	"github.com/xobserve/xo/query/internal/template"
	"github.com/xobserve/xo/query/internal/tenant"
	"github.com/xobserve/xo/query/internal/uiconfig"
	"github.com/xobserve/xo/query/internal/user"
	"github.com/xobserve/xo/query/internal/variables"
	"github.com/xobserve/xo/query/pkg/colorlog"
	"github.com/xobserve/xo/query/pkg/common"
	"github.com/xobserve/xo/query/pkg/config"
	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/log"
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

// Start ...
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
	go uiconfig.OverrideApiServerAddrInLocalUI()

	go func() {
		router := gin.New()
		router.Use(Cors())

		r := router.Group("/api")
		r.Use(gzip.Gzip(gzip.DefaultCompression))

		otelPlugin := otelgin.Middleware(config.Data.Common.AppName)
		// r.Use(otelPlugin)
		// global config
		r.GET("/config/ui", uiconfig.GetTenantConfig)
		r.GET("/config/dashboard", otelPlugin, InjectAccessToken(), uiconfig.GetDashboardConfig)

		// user apis
		r.POST("/login", user.Login)
		r.POST("/login/github", user.LoginGithub)
		r.POST("/logout", user.Logout)
		r.GET("/user/session", user.GetSession)
		r.POST("/account/password", MustLogin(), user.UpdateUserPassword)
		r.POST("/account/info", MustLogin(), user.UpdateUserInfo)
		r.POST("/account/updateData", MustLogin(), user.UpdateUserData)
		r.GET("/user/detail", MustLogin(), user.GetUserDetail)

		// variable apis
		r.POST("/variable/new", CheckLoginOrAk(), variables.AddNewVariable)
		r.POST("/variable/update", CheckLoginOrAk(), variables.UpdateVariable)
		r.DELETE("/variable/:teamId/:id", CheckLoginOrAk(), variables.DeleteVariable)
		r.GET("/variable/team", MustLogin(), otelPlugin, variables.QueryTeamVariables)

		// dashboard apis
		r.GET("/dashboard/byId/:teamId/:id", CheckLogin(), otelPlugin, dashboard.GetDashboard)
		r.POST("/dashboard/save", CheckLoginOrAk(), otelPlugin, dashboard.SaveDashboard)
		r.GET("/dashboard/search/:tenantId", CheckLogin(), InjectAccessToken(), otelPlugin, dashboard.Search)
		r.DELETE("/dashboard/:teamId/:id", CheckLoginOrAk(), dashboard.Delete)
		r.GET("/dashboard/team/:id", CheckLogin(), dashboard.GetTeamDashboards)
		r.GET("/dashboard/history/:teamId/:id", CheckLogin(), otelPlugin, dashboard.GetHistory)
		r.POST("/dashboard/star/:teamId/:id", MustLogin(), dashboard.Star)
		r.POST("/dashboard/unstar/:teamId/:id", MustLogin(), dashboard.UnStar)
		r.GET("/dashboard/starred", CheckLogin(), dashboard.GetAllStarred)
		r.GET("/dashboard/starred/:teamId/:id", dashboard.GetStarred)
		r.POST("/dashboard/weight", MustLogin(), dashboard.UpdateWeight)

		// annotation
		r.POST("/annotation", MustLogin(), annotation.SetAnnotation)
		r.GET("/annotation/:teamId/:namespace", annotation.QueryNamespaceAnnotations)
		r.DELETE("/annotation/:teamId/:namespace/:id", MustLogin(), annotation.RemoveAnnotation)
		r.DELETE("/annotation/group/:teamId/:namespace/:group/:expires", MustLogin(), annotation.RemoveGroupAnnotations)

		// admin apis
		r.DELETE("/admin/user/:id", CheckLoginOrAk(), admin.MarkUserAsDeleted)
		r.POST("/admin/user/restore/:id", CheckLoginOrAk(), admin.RestoreUser)
		r.POST("/admin/user/new", CheckLoginOrAk(), admin.AddNewUser)
		r.GET("/admin/users", CheckLogin(), otelPlugin, admin.GetUsers)
		r.POST("/admin/user", MustLogin(), admin.UpdateUser)
		r.POST("/admin/user/password", MustLogin(), admin.UpdateUserPassword)
		r.POST("/admin/user/role", MustLogin(), admin.UpdateUserRole)
		r.GET("/admin/auditlogs", CheckLogin(), admin.QueryAuditLogs)

		// datasource apis
		r.POST("/datasource/create", CheckLoginOrAk(), datasource.CreateDatasource)
		r.POST("/datasource/update", CheckLoginOrAk(), datasource.UpdateDatasource)
		r.GET("/datasource/all", CheckLogin(), otelPlugin, datasource.GetDatasources)
		r.DELETE("/datasource/:teamId/:id", CheckLoginOrAk(), datasource.DeleteDatasource)
		r.GET("/datasource/byId/:teamId/:id", MustLogin(), datasource.GetDatasourceById)
		r.GET("/datasource/test", proxy.TestDatasource)

		// tenant apis
		r.POST("/tenant/create", CheckLoginOrAk(), tenant.CreateTenant)
		r.POST("/tenant/user", CheckLoginOrAk(), tenant.SubmitTenantUser)
		r.POST("/tenant/user/role", CheckLoginOrAk(), tenant.ChangeTenantUserRole)
		r.DELETE("/tenant/user/:userId/:tenantId", CheckLoginOrAk(), tenant.DeleteTenantUser)
		r.GET("/tenant/user/is/in", InjectAccessToken(), MustLogin(), tenant.GetTenantsUserIn)
		r.POST("/tenant/update", CheckLoginOrAk(), tenant.UpdateTenant)
		r.DELETE("/tenant/:id", CheckLoginOrAk(), tenant.MarkDeleted)
		r.POST("/tenant/restore/:id", CheckLoginOrAk(), tenant.RestoreTenant)
		r.GET("/tenant/list/all", MustLogin(), tenant.QueryTenants)
		r.GET(("/tenant/users/:tenantId"), MustLogin(), tenant.QueryTenantUsers)
		r.POST("/tenant/switch/:id", MustLogin(), tenant.SwitchTenant)
		r.GET("/tenant/teams/:tenantId", MustLogin(), otelPlugin, teams.GetTenantTeams)
		r.GET("/tenant/byId/:id", MustLogin(), tenant.GetTenant)
		r.POST("/tenant/transfer/:tenantId/:username", MustLogin(), tenant.TransferTenant)
		r.POST("/tenant/leave/:id", MustLogin(), tenant.LeaveTenant)

		// teams apis
		r.POST("/team/member", CheckLoginOrAk(), teams.UpdateTeamMember)
		r.POST("/team/add/member", CheckLoginOrAk(), teams.AddTeamMembers)
		r.DELETE("/team/member/:teamId/:memberId", CheckLoginOrAk(), teams.DeleteTeamMember)
		r.POST("/team/update", CheckLoginOrAk(), teams.UpdateTeam)
		r.POST("/team/new", CheckLoginOrAk(), teams.AddNewTeam)
		r.DELETE("/team/:id", CheckLoginOrAk(), teams.MarkDeleted)
		r.POST("/team/restore/:id", CheckLoginOrAk(), teams.RestoreTeam)
		r.POST("/team/sidemenu", CheckLoginOrAk(), teams.UpdateSideMenu)
		r.POST("/team/transfer/:teamId/:username", CheckLoginOrAk(), teams.TransferTeam)
		r.GET("/team/byId/:id", CheckLogin(), teams.GetTeam)
		r.GET("/team/:id/members", CheckLogin(), teams.GetTeamMembers)
		r.GET("/team/sidemenu/:id", CheckLogin(), teams.GetSideMenu)
		r.POST("/team/switch/:teamId", MustLogin(), teams.SwitchTeam)
		r.GET("/team/user/is/in", CheckLogin(), teams.GetTeamsForUser)
		r.POST("/team/leave/:id", MustLogin(), teams.LeaveTeam)

		// template apis
		r.GET("/template/byId/:id", MustLogin(), template.GetTemplate)
		r.GET("/template/byScope/:type/:id", MustLogin(), template.GetScopeTemplates)
		r.GET("/template/use/byScope/:type/:id", MustLogin(), template.GetScopeUseTemplates)
		r.DELETE("/template/use/:scope/:scopeId/:templateId/:removeType", MustLogin(), template.RemoveTemplateUse)
		r.POST("/template/create", MustLogin(), template.CreateTemplate)
		r.POST("/template/update", MustLogin(), template.UpdateTemplate)
		r.POST("/template/content", MustLogin(), template.CreateTemplateContent)
		r.GET("/template/list/:templateType/:scope/:scopeId", MustLogin(), template.GetTemplates)
		r.GET("/template/contents/:id", MustLogin(), template.GetTemplateContents)
		r.GET("/template/content/:id", MustLogin(), template.GetTemplateContent)
		r.POST("/template/content/use", MustLogin(), template.UseTemplateContent)
		r.POST("/template/content/byIds", MustLogin(), template.GetTemplateContentsByIds)
		r.GET("/template/content/newest/:id", MustLogin(), template.GetTemplateNewestVersion)
		r.POST("/template/use", MustLogin(), template.UseTemplate)
		r.GET("/template/export/team/:id", MustLogin(), template.ExportTeamAsTemplate)
		r.POST("/template/sync", MustLogin(), template.SyncTemplate)
		r.POST("/template/disable", MustLogin(), template.DisableTemplate)
		r.POST("/template/enable", MustLogin(), template.EnableTemplate)
		r.POST("/template/unlink/dashboard/:teamId/:id", MustLogin(), template.UnlinkDashboardTemplate)
		r.POST("/template/unlink/datasource/:teamId/:id", MustLogin(), template.UnlinkDatasourceTemplate)
		r.POST("/template/unlink/variable/:teamId/:id", MustLogin(), template.UnlinkVariableTemplate)

		// api token
		r.POST("/accessToken/create", MustLogin(), accesstoken.CreateToken)
		r.POST("/accessToken/update", MustLogin(), accesstoken.UpdateToken)
		r.DELETE("/accessToken/:id", MustLogin(), accesstoken.DeleteToken)
		r.GET("/accessToken/list/:scope/:scopeId", MustLogin(), accesstoken.GetTokens)
		r.GET("/accessToken/view/:id", MustLogin(), accesstoken.ViewToken)

		// proxy apis
		r.Any("/proxy/:teamId/:id/*path", proxy.ProxyDatasource)
		r.Any("/proxy/:teamId/:id", proxy.ProxyDatasource)

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

func InjectAccessToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		ak := c.Request.Header.Get("X-AK")
		c.Set("accessToken", ak)
		c.Request.Header.Del("X-AK")
		c.Next()
	}
}

// APIs can be accessed by anonymous users when the configuration is set
// When disabled, unauthorized users will be rediret to login page
func CheckLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		u := user.CurrentUser(c)
		c.Set("currentUser", u)
		// if config.Data.User.AllowAnonymous {
		// 	c.Next()
		// 	return
		// }

		if u == nil {
			c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
			c.Abort()
			return
		}

		c.Next()
	}
}

// APIS cannot be accessed by anonymous users, give user a not-login tips
func MustLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		u := user.CurrentUser(c)
		c.Set("currentUser", u)
		if u == nil {
			c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
			c.Abort()
			return
		}
		ak := c.Request.Header.Get("X-AK")
		c.Set("accessToken", ak)
		c.Request.Header.Del("X-AK")
		c.Next()
	}
}

// APIS cannot be accessed by anonymous users, give user a not-login tips
func CheckLoginOrAk() gin.HandlerFunc {
	return func(c *gin.Context) {
		ak := c.Request.Header.Get("X-AK")
		c.Set("accessToken", ak)
		c.Request.Header.Del("X-AK")

		if ak == "" {
			// no ak passed, check login
			u := user.CurrentUser(c)
			c.Set("currentUser", u)
			if u == nil {
				c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
				c.Abort()
				return
			}
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
