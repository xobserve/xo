package gateway

import (
	"gopkg.in/olahol/melody.v1"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

type WebSocketServer struct {
	Melody *melody.Melody
	Echo   *echo.Echo
}

func NewWebSocketServer() *WebSocketServer {
	return &WebSocketServer{}
}

func (ws *WebSocketServer) Start() {
	e := echo.New()
	m := melody.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/ws", func(c echo.Context) error {
		m.HandleRequest(c.Response().Writer, c.Request())
		return nil
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		handMsg()
		m.BroadcastFilter(msg, func(q *melody.Session) bool {
			return true
		})
	})

	ws.Melody = m
	ws.Echo = e
	e.Start(Conf.GateWay.WebSocketHost)
}

func (ws *WebSocketServer) Close() {
	ws.Echo.Close()
	ws.Melody.Close()
}
