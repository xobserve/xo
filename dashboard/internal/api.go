package internal

import (
	"github.com/tracedt/koala/dashboard/internal/app"
	"github.com/tracedt/koala/dashboard/internal/session"
	"github.com/labstack/echo"
)

func apiRoute(e *echo.Echo) {
	// login interface
	e.POST("/dashboard/login", session.Login)
	e.POST("/dashboard/logout", session.Logout)

	// application
	e.GET("/dashboard/app/nameList", app.NameList)
	e.GET("/dashboard/app", app.Dashboard)
	e.GET("/dashboard/app/agentList", app.AgentList)
	e.GET("/dashboard/app/alerts", app.Alerts)
}
