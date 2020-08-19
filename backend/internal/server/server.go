package server

import (
	"github.com/apm-ai/datav/backend/internal/annotation"
	"github.com/apm-ai/datav/backend/internal/bootConfig"
	"github.com/apm-ai/datav/backend/internal/acl"
	"github.com/apm-ai/datav/backend/internal/users"
	"github.com/apm-ai/datav/backend/internal/datasources"
	"errors"
	"github.com/apm-ai/datav/backend/pkg/utils"
	// "net/http"

	"database/sql"

	"github.com/apm-ai/datav/backend/internal/session"
	"github.com/apm-ai/datav/backend/pkg/config"
	"github.com/apm-ai/datav/backend/pkg/common"
	"github.com/apm-ai/datav/backend/pkg/db"
	"github.com/apm-ai/datav/backend/pkg/i18n"
	"github.com/apm-ai/datav/backend/pkg/log"
	"github.com/apm-ai/datav/backend/internal/registry"	
	_ "github.com/mattn/go-sqlite3"
	"github.com/apm-ai/datav/backend/internal/plugins"
	"github.com/apm-ai/datav/backend/internal/dashboard"
	"github.com/apm-ai/datav/backend/internal/cache"
	"github.com/apm-ai/datav/backend/internal/search"
	"github.com/apm-ai/datav/backend/internal/folders"
	"github.com/apm-ai/datav/backend/internal/teams"
	"github.com/apm-ai/datav/backend/internal/admin"
	"github.com/apm-ai/datav/backend/internal/sidemenu"
	"github.com/gin-gonic/gin"
	"net/http"
)
 
// Web ...
type Server struct {
}

// New ... 
func New() *Server {
	return &Server{}
} 

var logger = log.RootLogger.New("logger","server")

// Start ...1
func (s *Server) Start() error {
	logger.Debug("server config", "config",*config.Data)
	// start registered services
	services := registry.GetServices()
	for _, service := range services {
		service.Instance.Init()
	}

	err := s.initDB()
	if err != nil {
		logger.Error("open sqlite error","error",err.Error())
		return err
	}

	// init search cache
	cache.InitCache()

	go func() {
		gin.SetMode(gin.ReleaseMode)
		r := gin.New()
		r.Use(Cors())
		  
		// no auth apis
		{
			r.POST("/api/login",session.Login)
			r.POST("/api/logout",session.Logout)
			r.Any("/api/proxy/:datasourceID/*target", proxy)
			r.Any("/api/proxy/:datasourceID", proxy)
			r.GET("/api/bootConfig", bootConfig.QueryBootConfig)
			r.POST("/api/testdata",QueryTestdata)
		}

		// auth apis
		authR := r.Group("",Auth())
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
				folderR.DELETE("/id/:id",folders.DeleteFolder)
				folderR.POST("/new",folders.NewFolder)
				folderR.GET("/all",folders.GetAll)
			}

			userR := authR.Group("/api/users") 
			{ 
				userR.GET("", users.GetUsers)
				userR.GET("/user", users.GetUser)	
				userR.PUT("/user/password", users.ChangePassword)		
				userR.GET("/user/sidemenus",users.GetSideMenus)
				userR.PUT("/user/sidemenu",users.UpdateSideMenu)
				userR.PUT("/user/info",users.UpdateUserInfo)
				userR.GET("/user/teamRoles", users.GetUserTeamRoles)	
				userR.GET("/user/sidemenu/:teamId", users.CanUseMenu)
			}

			teamR := authR.Group("/api/teams") 
			{
				teamR.GET("", teams.GetTeams)
				teamR.GET("/team", teams.GetTeam)
				teamR.GET("/members/:teamId", teams.GetTeamMembers)	
				teamR.GET("/member/:teamId/:userId", teams.GetTeamMember)	
				teamR.POST("/leave/:teamId",teams.LeaveTeam)
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
				annotationR.GET("",annotation.GetAnnotations)
				annotationR.POST("",annotation.CreateAnnotation)
				annotationR.PUT("/:id",annotation.UpdateAnnotation)
				annotationR.DELETE("/:id",annotation.DeleteAnnotation)
			}

			adminR := authR.Group("/api/admin",AdminAuth())
			{
				adminR.PUT("/password", admin.UpdatePassword)
				adminR.PUT("/user/:id", admin.UpdateUser)
				adminR.DELETE("/user/:id", admin.DeleteUser)
				adminR.POST("/user/new", admin.NewUser)
				adminR.POST("/team/new", admin.NewTeam)
			}
		}

		r.Run(config.Data.Web.Addr)
	}()


	return nil
}

// Close ...
func (s *Server) Close() error {
	return nil
}



func (s *Server) initDB() error {
	exist,_ := utils.FileExists("./datav.db")
	if !exist {
		return errors.New("db file not exist, please run init commant")
	}
	d, err := sql.Open("sqlite3", "./datav.db")
	if err != nil {
		return err
	}

	db.SQL = d
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
	return func(c *gin.Context)  {
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
	return func(c *gin.Context)  {
		if !acl.IsGlobalAdmin(c) {
			c.JSON(403, common.ResponseI18nError(i18n.NoPermission))
			c.Abort()
			return
		}
		c.Next()
	}
}