package gateway

import "github.com/teamsaas/sdks"

type GateWay struct {
	TcpServer       *TcpServer
	WebSocketServer *WebSocketServer
}

func NewGateWay() *GateWay {
	return &GateWay{
		TcpServer:       NewTcpServer(),
		WebSocketServer: NewWebSocketServer(),
	}
}

func (gw *GateWay) Start() {
	sdks.InitLogger(Conf.Common.LogPath, Conf.Common.LogLevel, Conf.Common.IsDebug,"gateway" )
	go gw.TcpServer.Start()
	go gw.WebSocketServer.Start()
}
