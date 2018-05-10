package service

import (
	"fmt"
	"net"
	"sync"
	"time"

	"go.uber.org/zap"
)

type Broker struct {
	wg       *sync.WaitGroup
	running  bool
	listener net.Listener
	clients  map[uint64]net.Conn
	store    Storer
	sync.Mutex
}

func NewBroker() *Broker {
	b := &Broker{
		wg:      &sync.WaitGroup{},
		clients: make(map[uint64]net.Conn),
	}
	// init base config
	InitConfig()
	InitLogger(Conf.Common.LogPath, Conf.Common.LogLevel, Conf.Common.IsDebug)
	L.Info("base configuration loaded")

	return b
}

func (b *Broker) Start() {

	addr := net.JoinHostPort(Conf.Broker.Host, Conf.Broker.Port)
	l, err := net.Listen("tcp", addr)
	if err != nil {
		L.Fatal("Fatal error when listening", zap.Error(err), zap.String("addr", addr))
	}
	b.listener = l

	go b.Accept()

	b.running = true

	// init store
	switch Conf.Store.Engine {
	case "mem":
		b.store = &MemStore{
			bk:        b,
			topicConn: make(map[string][]uint64),
		}
	}

	b.store.Init()
}
func (b *Broker) Shutdown() {
	b.running = false
	b.listener.Close()

	for _, conn := range b.clients {
		conn.Close()
	}

	L.Sync()
	b.wg.Wait()
}

func (b *Broker) Accept() {
	tmpDelay := ACCEPT_MIN_SLEEP
	var id uint64
	for b.running {
		conn, err := b.listener.Accept()
		if err != nil {
			if ne, ok := err.(net.Error); ok && ne.Temporary() {
				L.Error("Temporary Client Accept Error ", zap.Error(err))
				time.Sleep(tmpDelay)
				tmpDelay *= 2
				if tmpDelay > ACCEPT_MAX_SLEEP {
					tmpDelay = ACCEPT_MAX_SLEEP
				}
			} else if b.running {
				L.Error("Client Accept Error", zap.Error(err))
			}
			continue
		}
		tmpDelay = ACCEPT_MIN_SLEEP
		id++
		go b.process(conn, id)
	}
}

func (b *Broker) process(conn net.Conn, id uint64) {
	b.wg.Add(1)
	defer b.wg.Done()

	b.Lock()
	b.clients[id] = conn
	b.Unlock()

	L.Info("发现新的连接", zap.Uint64("conn_id", id))
	defer func() {
		L.Info("关闭连接", zap.Uint64("conn_id", id))

		b.Lock()
		delete(b.clients, id)
		b.Unlock()

		conn.Close()
	}()

	cli := &client{
		cid:    id,
		conn:   conn,
		bk:     b,
		pusher: make(chan Message, 100),
		subs:   make(map[string]struct{}),
	}

	err := cli.waitForConnect()
	if err != nil {
		fmt.Println("客户端长时间不发送Connect报文,error:", err)
		return
	}

	go cli.writeLoop()
	err = cli.readLoop()
	if err != nil {
		fmt.Println("read loop,error:", err)
	}
}
