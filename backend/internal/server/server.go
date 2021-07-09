package server

import (
	"context"
	"os"
	"path/filepath"
	"time"

	"github.com/datav-io/datav/backend/internal/acl"
	"github.com/datav-io/datav/backend/internal/annotation"
	"github.com/datav-io/datav/backend/internal/bootConfig"
	"github.com/datav-io/datav/backend/internal/datasources"
	"github.com/datav-io/datav/backend/internal/users"

	// "net/http"

	"net/http"

	"github.com/datav-io/datav/backend/internal/admin"
	"github.com/datav-io/datav/backend/internal/alerting"
	"github.com/datav-io/datav/backend/internal/cache"
	"github.com/datav-io/datav/backend/internal/dashboard"
	"github.com/datav-io/datav/backend/internal/folders"
	"github.com/datav-io/datav/backend/internal/plugins"
	"github.com/datav-io/datav/backend/internal/registry"
	"github.com/datav-io/datav/backend/internal/search"
	"github.com/datav-io/datav/backend/internal/session"
	"github.com/datav-io/datav/backend/internal/sidemenu"
	"github.com/datav-io/datav/backend/internal/teams"
	"github.com/datav-io/datav/backend/pkg/common"
	"github.com/datav-io/datav/backend/pkg/config"
	"github.com/datav-io/datav/backend/pkg/i18n"
	"github.com/datav-io/datav/backend/pkg/log"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/sync/errgroup"
)

// Web ...
type Server struct {
	context       context.Context
	shutdownFn    context.CancelFunc
	childRoutines *errgroup.Group
}

// New ...
func New() *Server {
	rootCtx, shutdownFn := context.WithCancel(context.Background())
	childRoutines, childCtx := errgroup.WithContext(rootCtx)
	return &Server{
		context:       childCtx,
		shutdownFn:    shutdownFn,
		childRoutines: childRoutines,
	}
}

var logger = log.RootLogger.New("logger", "server")

// Start ...1
func (s *Server) Start() error {
	logger.Debug("server config", "config", *config.Data)
	// start registered services
	services := registry.GetServices()
	for _, srv := range services {
		err := srv.Instance.Init()
		if err != nil {
			return err
		}

		service, ok := srv.Instance.(registry.BackgroundService)
		if !ok {
			continue
		}

		s.childRoutines.Go(func() error {
			err := service.Run(s.context)
			if err != nil {
				if err != context.Canceled {
					// Server has crashed.
					logger.Error("Stopped "+srv.Name, "reason", err)
				} else {
					logger.Debug("Stopped "+srv.Name, "reason", err)
				}
				return err
			}
			return nil
		})

	}

	err := initDatabase()
	if err != nil {
		logger.Error("init database error", "error", err.Error())
		return err
	}

	// init annotation sql store
	annotation.Init()

	// init search cache
	cache.InitCache()

	// int timer job
	startTimer()

	gin.SetMode(gin.ReleaseMode)
	go func() {
		r := gin.New()
		r.Use(Cors())

		// no auth apis
		{
			r.POST("/api/login", session.Login)
			r.POST("/api/logout", session.Logout)
			r.Any("/api/proxy/:datasourceID/*target", datasources.Proxy)
			r.Any("/api/proxy/:datasourceID", datasources.Proxy)
			r.GET("/api/bootConfig", bootConfig.QueryBootConfig)
			r.POST("/api/testdata", QueryTestdata)
		}

		// auth apis
		authR := r.Group("", Auth())
		{
			pluginR := authR.Group("/api/plugins")
			{
				pluginR.GET("", plugins.GetPlugins)
				pluginR.GET("/setting", plugins.GetPluginSetting)
				pluginR.GET("/markdown", plugins.GetPluginMarkdown)
			}

			datasourceR := authR.Group("/api/datasources")
			{
				datasourceR.GET("", datasources.GetDataSources)
				datasourceR.GET("/:dataSourceID", datasources.GetDataSource)
				datasourceR.DELETE("/:dataSourceID", datasources.DeleteDataSource)
				datasourceR.POST("/new", datasources.NewDataSource)
				datasourceR.PUT("/edit", datasources.EditDataSource)
			}

			dashboardR := authR.Group("/api/dashboard")
			{
				dashboardR.POST("/save", dashboard.SaveDashboard)
				dashboardR.DELETE("/id/:id", dashboard.DelDashboard)
				dashboardR.GET("/uid/:uid", dashboard.GetDashboard)
				dashboardR.POST("/import", dashboard.ImportDashboard)
				dashboardR.GET("/tags", dashboard.GetAllTags)
				dashboardR.GET("/acl/team/:id", dashboard.GetTeamAcl)
				dashboardR.POST("/acl/team", dashboard.UpdateTeamAcl)
				dashboardR.POST("/acl/user", dashboard.AddUserAcl)
				dashboardR.PUT("/acl/user", dashboard.UpdateUserAcl)
				dashboardR.DELETE("/acl/user/:dashId/:userId", dashboard.DeleteUserAcl)
				dashboardR.GET("/acl/user/:dashId", dashboard.GetUserAcl)
				dashboardR.PUT("/ownedBy", dashboard.UpdateOwnedBy)
			}

			searchR := authR.Group("/api/search")
			{
				searchR.GET("", search.Search)
				searchR.GET("/dashboard", search.Dashboard)
			}

			folderR := authR.Group("/api/folder")
			{
				folderR.GET("/checkExistByName", folders.CheckExistByName)
				folderR.GET("/uid/:uid", folders.GetByUid)
				folderR.PUT("/id/:id", folders.UpdateFolder)
				folderR.DELETE("/id/:id", folders.DeleteFolder)
				folderR.POST("/new", folders.NewFolder)
				folderR.GET("/all", folders.GetAll)
			}

			userR := authR.Group("/api/users")
			{
				userR.GET("", users.GetUsers)
				userR.GET("/user", users.GetUser)
				userR.PUT("/user/password", users.ChangePassword)
				userR.GET("/user/sidemenus", users.GetSideMenus)
				userR.PUT("/user/sidemenu", users.UpdateSideMenu)
				userR.PUT("/user/info", users.UpdateUserInfo)
				userR.GET("/user/teamRoles", users.GetUserTeamRoles)
				userR.GET("/user/sidemenu/:teamId", users.CanUseMenu)
			}

			teamR := authR.Group("/api/teams")
			{
				teamR.GET("", teams.GetTeams)
				teamR.GET("/team", teams.GetTeam)
				teamR.GET("/members/:teamId", teams.GetTeamMembers)
				teamR.GET("/member/:teamId/:userId", teams.GetTeamMember)
				teamR.POST("/leave/:teamId", teams.LeaveTeam)
				teamR.POST("/members/:teamId", teams.AddTeamMembers)
				teamR.DELETE("/:teamId/:memberId", teams.DeleteTeamMember)
				teamR.PUT("/team/:teamId", teams.UpdateTeam)
				teamR.POST("/team/:teamId/member", teams.UpdateTeamMember)
				teamR.POST("/transfer/:teamId", teams.TransferTeam)
				teamR.DELETE("/:teamId", teams.DeleteTeam)
				teamR.GET("/permissions/:teamId", teams.GetTeamPermissions)
				teamR.POST("/permissions/:teamId", teams.UpdateTeamPermission)
			}

			sidemenuR := authR.Group("/api/sidemenu")
			{
				sidemenuR.GET(":teamId", sidemenu.GetMenu)
				sidemenuR.POST(":teamId", sidemenu.CreateMenu)
				sidemenuR.PUT(":teamId", sidemenu.UpdateMenu)
			}

			annotationR := authR.Group("/api/annotations")
			{
				annotationR.GET("", annotation.GetAnnotations)
				annotationR.POST("", annotation.CreateAnnotation)
				annotationR.PUT("/:id", annotation.UpdateAnnotation)
				annotationR.DELETE("/:id", annotation.DeleteAnnotation)
			}

			adminR := authR.Group("/api/admin", AdminAuth())
			{
				adminR.PUT("/password", admin.UpdatePassword)
				adminR.PUT("/user/:id", admin.UpdateUser)
				adminR.DELETE("/user/:id", admin.DeleteUser)
				adminR.POST("/user/new", admin.NewUser)
				adminR.POST("/team/new", admin.NewTeam)
			}

			alertingR := authR.Group("/api/alerting")
			{
				alertingR.POST("/notification/:teamId", alerting.AddNotification)
				alertingR.PUT("/notification/:teamId", alerting.UpdateNotification)
				alertingR.DELETE("/notification/:id", alerting.DeleteNotification)
				alertingR.GET("/notification/:teamId", alerting.GetNotifications)
				alertingR.POST("/test/notification", alerting.TestNotification)
				alertingR.POST("/test/rule", alerting.TestRule)
				alertingR.GET("/state/:dashId", alerting.GetDashboardState)
				alertingR.GET("/history", alerting.GetHistory)
				alertingR.GET("/rules", alerting.GetRules)
				alertingR.POST("/pause", alerting.PauseAlert)

				alertingR.POST("/history/filter", alerting.FilterHistory)
			}
		}

		err := r.Run(config.Data.Server.BackendPort)
		if err != nil {
			logger.Crit("start backend server error", "error", err)
			panic(err)
		}
	}()

	go func() {
		router := mux.NewRouter()

		spa := spaHandler{staticPath: "ui/build/", indexPath: "index.html"}
		router.PathPrefix("/").Handler(spa)

		srv := &http.Server{
			Handler: router,
			Addr:    config.Data.Server.UIPort,
			// Good practice: enforce timeouts for servers you create!
			WriteTimeout: 15 * time.Second,
			ReadTimeout:  15 * time.Second,
		}

		srv.ListenAndServe()
	}()

	return nil
}

// Close ...
func (s *Server) Close() error {
	return nil
}

// Cors is a gin middleware for cross domain.
func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method

		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Content-Type,AccessToken,X-CSRF-Token, Authorization,X-Token, X-PANEL-ID, X-DASHBOARD-ID,*")
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

// Auth is a gin middleware for user auth
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		user := session.CurrentUser(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, common.ResponseI18nError("error.needLogin"))
			c.Abort()
			return
		}
		c.Next()
	}
}

func AdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !acl.IsGlobalAdmin(c) {
			c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
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
