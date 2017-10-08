package gateway

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
	InitLogger()
	go gw.TcpServer.Start()
	go gw.WebSocketServer.Start()
}
