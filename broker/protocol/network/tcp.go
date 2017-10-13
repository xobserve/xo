package network

import (
"io"
"net"
"strings"
"time"
"go.uber.org/zap"
"github.com/teamsaas/sdks"
"github.com/teamsaas/tools/ipmanager"
	"github.com/teamsaas/meq/broker/config"
)

type TcpProvider struct {
	perIPConnCounter ipmanager.PerIPConnCounter
	ln               net.Listener
}

func NewTcpProvider() *TcpProvider {
	return &TcpProvider{}
}

func (tp *TcpProvider) Start() {
	var lastPerIPErrorTime time.Time
	ln, err := net.Listen("tcp", config.Conf.GateWay.TcpHost)
	if err != nil {
		sdks.Logger.Panic("Listen", zap.Error(err))
	}
	tp.ln = ln

	// start accepting
	for {
		c, err := tp.acceptConn(ln, &lastPerIPErrorTime)
		if err != nil {
			sdks.Logger.Panic("GateWay", zap.String("acceptConn", err.Error()))
			break
		}

		go serve(c)
	}
}

func (tp *TcpProvider) acceptConn(ln net.Listener, lastPerIPErrorTime *time.Time) (net.Conn, error) {
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
		c.SetReadDeadline(time.Now().Add(time.Duration(common.Conf.GateWay.ConnectionTimeout) * time.Second))
		if common.Conf.GateWay.MaxConnSperIp > 0 {
			pic := tp.wrapPerIPConn(c)
			if pic == nil {
				if time.Since(*lastPerIPErrorTime) > time.Minute {
					sdks.Logger.Error("[ERROR] The number of connections from ", zap.String("ip", ipmanager.GetConnIP4(c).String()), zap.Int("maxConnSperIp", common.Conf.GateWay.MaxConnSperIp))
					*lastPerIPErrorTime = time.Now()
				}
				continue
			}
			c = pic
		}
		return c, nil
	}
}

func (tp *TcpProvider) wrapPerIPConn(c net.Conn) net.Conn {
	ip := ipmanager.GetUint32IP(c)
	if ip == 0 {
		return c
	}
	n := tp.perIPConnCounter.Register(ip)
	if n > common.Conf.GateWay.MaxConnSperIp {
		tp.perIPConnCounter.Unregister(ip)
		c.Close()
		return nil
	}
	return ipmanager.AcquirePerIPConn(c, ip, &tp.perIPConnCounter)
}


func (tp *TcpProvider) Close() {
	tp.ln.Close()
}
