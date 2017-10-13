package network

import (
	"gopkg.in/olahol/melody.v1"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"fmt"
)

type WebSocketProvider struct {
	Melody *melody.Melody
	Echo   *echo.Echo
}

func NewWebSocketProvider() *WebSocketProvider {
	return &WebSocketProvider{}
}

func (ws *WebSocketProvider) Start() {
	e := echo.New()
	m := melody.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/ws", func(c echo.Context) error {
		m.HandleRequest(c.Response().Writer, c.Request())
		return nil
	})
	m.HandleConnect(func(s *melody.Session) {
		fmt.Println("HandleConnect", s)
		ci := &ConnInfo{}
		ci.tp = 2
		ci.s = s
	})

	//m.HandleMessageBinary(func(s *melody.Session, msg []byte) {
	//	m.BroadcastFilter(msg, func(q *melody.Session) bool {
	//		return true
	//	})
	//})
	m.HandleMessageBinary(wsServe)

	ws.Melody = m
	ws.Echo = e
	e.Start(common.Conf.GateWay.WebSocketHost)
}

func (ws *WebSocketProvider) Close() {
	ws.Echo.Close()
	ws.Melody.Close()
}
