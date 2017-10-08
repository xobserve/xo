package gateway

import (
	"io"
	"net"
	"strings"
	"time"
	"go.uber.org/zap"
	"github.com/teamsaas/sdks"
	"github.com/teamsaas/tools/ipmanager"
)

type TcpServer struct {
	// 记录每个IP的连接数量
	perIPConnCounter ipmanager.PerIPConnCounter
	ln               net.Listener
}

func NewTcpServer() *TcpServer {
	return &TcpServer{}
}

func (ts *TcpServer) Start() {
	var lastPerIPErrorTime time.Time
	//开始接收tcp连接请求
	ln, err := net.Listen("tcp", Conf.GateWay.TcpHost)
	if err != nil {
		sdks.Logger.Panic("Listen", zap.Error(err))
	}
	ts.ln = ln

	// 接收并处理连接请求
	for {
		c, err := ts.acceptConn(ln, &lastPerIPErrorTime)
		if err != nil {
			sdks.Logger.Panic("GateWay", zap.String("acceptConn", err.Error()))
			break
		}
		// 启动worker去处理连接
		go ts.serve(c)
	}
}

func (ts *TcpServer) acceptConn(ln net.Listener, lastPerIPErrorTime *time.Time) (net.Conn, error) {
	for {
		c, err := ln.Accept()
		if err != nil {
			if c != nil {
				sdks.Logger.Error("[FATAL] net.Listener returned non-nil conn and non-nil error : ", zap.Error(err))
			}
			if netErr, ok := err.(net.Error); ok && netErr.Temporary() {
				sdks.Logger.Error("[ERROR] Temporary error when accepting new connections: ", zap.Error(err), zap.Any("Accept", netErr))
				time.Sleep(time.Second)
				continue
			}
			if err != io.EOF && !strings.Contains(err.Error(), "use of closed network connection") {
				sdks.Logger.Error("[ERROR] Permanent error when accepting new connections: ", zap.String("Accept", err.Error()))
				return nil, err
			}
			return nil, io.EOF
		}
		if c == nil {
			panic("BUG: net.Listener returned (nil, nil)")
		}
		c.SetReadDeadline(time.Now().Add(time.Duration(Conf.GateWay.ConnectionTimeout) * time.Second))
		if Conf.GateWay.MaxConnSperIp > 0 {
			pic := ts.wrapPerIPConn(c)
			if pic == nil {
				if time.Since(*lastPerIPErrorTime) > time.Minute {
					sdks.Logger.Error("[ERROR] The number of connections from ", zap.String("ip", ipmanager.GetConnIP4(c).String()), zap.Int("maxConnSperIp", Conf.GateWay.MaxConnSperIp))
					*lastPerIPErrorTime = time.Now()
				}
				continue
			}
			c = pic
		}
		return c, nil
	}
}

func (ts *TcpServer) wrapPerIPConn(c net.Conn) net.Conn {
	ip := ipmanager.GetUint32IP(c)
	if ip == 0 {
		return c
	}
	n := ts.perIPConnCounter.Register(ip)
	if n > Conf.GateWay.MaxConnSperIp {
		ts.perIPConnCounter.Unregister(ip)
		c.Close()
		return nil
	}
	return ipmanager.AcquirePerIPConn(c, ip, &ts.perIPConnCounter)
}

func (ts *TcpServer) serve(conn net.Conn) {
	defer func() {
		conn.Close()
		if err := recover(); err != nil {
			sdks.Logger.Error("readPacket", zap.Any("recover", err))
			return
		}
	}()
	handMsg()
	sdks.Logger.Info("LogOut close conn", zap.String("conn", conn.LocalAddr().String()))
}

func (ts *TcpServer) Close() {
	ts.ln.Close()
}
