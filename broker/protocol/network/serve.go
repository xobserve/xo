package messager

import (
	"net"
	"gopkg.in/olahol/melody.v1"
	"github.com/teamsaas/sdks"
	"go.uber.org/zap"
)

type ConnInfo struct {
	// conn Type: 1;tcp 2:websocket
	tp int
	c  net.Conn
	s  *melody.Session
	rip string
}

//tcp service
func serve(c net.Conn) {
	defer func() {
		if err := recover(); err != nil {
			sdks.Logger.Info("user's main goroutine has a panic error", zap.Error(err.(error)))
		}
	}()
	ci := &ConnInfo{}
	ci.tp = 1
	ci.c = c
	ci.rip = ci.c.RemoteAddr().String()
}

//ws service
func wsServe(s *melody.Session, msg []byte) {

}
