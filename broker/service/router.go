package service

import (
	"encoding/binary"
	"net"
	"sync"
	"time"

	"github.com/chaingod/talent"
	"github.com/meqio/meq/proto"
	"go.uber.org/zap"
)

type Router struct {
	bk       *Broker
	cluster  map[string]struct{}
	conns    map[string]net.Conn
	listener net.Listener
	sync.RWMutex
}

const (
	ROUTER_MSG_ADD  = 'a'
	ROUTER_MSG_PING = 'b'
	ROUTER_MSG_PONG = 'c'
)

type RouterTarget struct {
	Addr string
	Cid  uint64
}

func (r *Router) Init() {
	r.cluster = make(map[string]struct{})
	r.conns = make(map[string]net.Conn)

	l, err := net.Listen("tcp", Conf.Router.Addr)
	if err != nil {
		L.Fatal("Fatal error when listening router", zap.Error(err), zap.String("addr", Conf.Router.Addr))
	}
	r.listener = l

	go func() {
		for {
			tmpDelay := ACCEPT_MIN_SLEEP
			var id uint64
			for r.bk.running {
				conn, err := r.listener.Accept()
				if err != nil {
					if ne, ok := err.(net.Error); ok && ne.Temporary() {
						L.Error("Temporary Client Accept Error ", zap.Error(err))
						time.Sleep(tmpDelay)
						tmpDelay *= 2
						if tmpDelay > ACCEPT_MAX_SLEEP {
							tmpDelay = ACCEPT_MAX_SLEEP
						}
					}
					continue
				}
				tmpDelay = ACCEPT_MIN_SLEEP
				id++
				go r.process(conn, id)
			}
		}
	}()

	// manages the connections with other nodes in cluster
	go func() {
		for {
			retries := make([]string, 0)
			r.RLock()
			for addr := range r.cluster {
				_, ok := r.conns[addr]
				if !ok {
					retries = append(retries, addr)
				} else {
					// ping
				}
			}
			r.RUnlock()

			for _, addr := range retries {
				nc, err := net.Dial("tcp", addr)
				if err != nil {
					r.Lock()
					delete(r.cluster, addr)
					r.Unlock()
					L.Warn("router connect to other node error", zap.Error(err), zap.String("addr", addr))
					continue
				}
				r.Lock()
				r.conns[addr] = nc
				r.Unlock()
				go r.ping(addr, nc)
			}
			time.Sleep(10 * time.Second)
		}
	}()
}

func (r *Router) ping(addr string, c net.Conn) {
	go func() {
		for r.bk.running {
			msg := make([]byte, 5)
			binary.PutUvarint(msg[:4], 1)
			msg[4] = ROUTER_MSG_PING
			c.SetWriteDeadline(time.Now().Add(WRITE_DEADLINE))
			c.Write(msg)
			time.Sleep(30 * time.Second)
		}
	}()

	defer func() {
		c.Close()
		r.Lock()
		delete(r.conns, addr)
		r.Unlock()
	}()

	for r.bk.running {
		header := make([]byte, 5)
		_, err := talent.ReadFull(c, header, MAX_IDLE_TIME)
		if err != nil {
			return
		}
	}
}

func (r *Router) process(conn net.Conn, cid uint64) {
	defer func() {
		conn.Close()
	}()

	for {
		header := make([]byte, 4)
		if _, err := talent.ReadFull(conn, header, MAX_IDLE_TIME); err != nil {
			L.Info("router process header error", zap.Error(err))
			return
		}
		bl, _ := binary.Uvarint(header)
		body := make([]byte, bl)
		if _, err := talent.ReadFull(conn, body, MAX_IDLE_TIME); err != nil {
			L.Info("router process body error", zap.Error(err))
			return
		}

		switch body[0] {
		case ROUTER_MSG_ADD:
			msg, cid, err := proto.UnpackRouteMsg(body[1:])
			if err != nil {
				L.Warn("route process error", zap.Error(err))
				return
			}
			c, ok := r.bk.clients[cid]
			if ok {
				c.spusher <- msg
			}
		case ROUTER_MSG_PING:
			msg := make([]byte, 5)
			binary.PutUvarint(msg[:4], 1)
			msg[4] = ROUTER_MSG_PONG
			conn.Write(msg)
		}
	}
}

func (r *Router) route(msg proto.Message, outer []Sess) {
	for _, s := range outer {
		conn, ok := r.conns[s.Addr]
		if !ok {
			continue
		}
		m := proto.PackRouteMsg(msg, ROUTER_MSG_ADD, s.Cid)
		conn.SetWriteDeadline(time.Now().Add(2 * time.Second))
		conn.Write(m)
	}
}
