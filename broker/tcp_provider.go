package broker

import (
	"io"
	"net"
	"strings"
	"time"

	"github.com/teamsaas/meq/common/logging"
	"github.com/teamsaas/meq/config"
	"github.com/teamsaas/tools/ipmanager"
	"go.uber.org/zap"
)

type TcpProvider struct {
	perIPConnCounter ipmanager.PerIPConnCounter
	ln               net.Listener
}

func NewTcpProvider() *TcpProvider {
	return &TcpProvider{}
}

// start tcp server
func (tp *TcpProvider) Start() {
	var lastPerIPErrorTime time.Time
	ln, err := net.Listen("tcp", config.Conf.Broker.TcpAddr)
	if err != nil {
		logging.Logger.Panic("Listen", zap.Error(err))
	}
	tp.ln = ln
	logging.Logger.Info("tcp provider startted", zap.String("addr", config.Conf.Broker.TcpAddr))

	for {
		c, err := tp.acceptConn(ln, &lastPerIPErrorTime)
		if err != nil {
			logging.Logger.Panic("GateWay", zap.String("acceptConn", err.Error()))
			break
		}

		conn := broker.NewConn(c)
		go conn.Process()
	}
}

//tcp accept Conn ;judgment MaxConnSperIp; set ReadDeadline
func (tp *TcpProvider) acceptConn(ln net.Listener, lastPerIPErrorTime *time.Time) (net.Conn, error) {
	for {
		c, err := ln.Accept()
		if err != nil {
			if c != nil {
				logging.Logger.Error("[FATAL] net.Listener returned non-nil conn and non-nil error : ", zap.Error(err))
			}
			if netErr, ok := err.(net.Error); ok && netErr.Temporary() {
				logging.Logger.Error("[ERROR] Temporary error when accepting new connections: ", zap.Error(err), zap.Any("Accept", netErr))
				time.Sleep(time.Second)
				continue
			}
			if err != io.EOF && !strings.Contains(err.Error(), "use of closed network connection") {
				logging.Logger.Error("[ERROR] Permanent error when accepting new connections: ", zap.String("Accept", err.Error()))
				return nil, err
			}
			return nil, io.EOF
		}
		if c == nil {
			panic("BUG: net.Listener returned (nil, nil)")
		}
		c.SetReadDeadline(time.Now().Add(time.Duration(config.Conf.Broker.ConnectionTimeout) * time.Second))
		if config.Conf.Broker.MaxConnSperIp > 0 {
			pic := tp.wrapPerIPConn(c)
			if pic == nil {
				if time.Since(*lastPerIPErrorTime) > time.Minute {
					logging.Logger.Error("[ERROR] The number of connections from ", zap.String("ip", ipmanager.GetConnIP4(c).String()), zap.Int("maxConnSperIp", config.Conf.Broker.MaxConnSperIp))
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
	if n > config.Conf.Broker.MaxConnSperIp {
		tp.perIPConnCounter.Unregister(ip)
		c.Close()
		return nil
	}
	return ipmanager.AcquirePerIPConn(c, ip, &tp.perIPConnCounter)
}

func (tp *TcpProvider) Close() {
	tp.ln.Close()
}
