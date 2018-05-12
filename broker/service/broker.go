package service

import (
	"fmt"
	"log"
	"net"
	"sync"
	"time"

	"net/http"
	_ "net/http/pprof"

	"github.com/chaingod/talent"
	"github.com/meqio/meq/proto"
	"go.uber.org/zap"
)

type Broker struct {
	wg       *sync.WaitGroup
	running  bool
	listener net.Listener
	clients  map[uint64]*client
	store    Storer
	router   *Router
	timer    *Timer
	sync.Mutex
}

func NewBroker() *Broker {
	b := &Broker{
		wg:      &sync.WaitGroup{},
		clients: make(map[uint64]*client),
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
	// init Router
	b.router = &Router{
		bk: b,
	}
	b.router.Init()

	// init store
	switch Conf.Store.Engine {
	case "mem":
		b.store = &MemStore{
			bk: b,
		}
	}

	b.store.Init()

	// init timer
	b.timer = &Timer{
		bk: b,
	}
	b.timer.Init()

	go func() {
		log.Println(http.ListenAndServe("localhost:6061", nil))
	}()

}
func (b *Broker) Shutdown() {
	b.running = false
	b.listener.Close()

	for _, c := range b.clients {
		//@todo
		// send stop signal instead
		c.conn.Close()
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
	defer func() {
		b.Lock()
		delete(b.clients, id)
		b.Unlock()
		conn.Close()
		L.Info("关闭连接", zap.Uint64("conn_id", id))
	}()

	b.wg.Add(1)
	defer b.wg.Done()

	L.Info("发现新的连接", zap.Uint64("conn_id", id))

	cli := &client{
		cid:     id,
		conn:    conn,
		bk:      b,
		spusher: make(chan proto.Message, 100),
		gpusher: make(chan pushPacket, 100),
		subs:    make(map[string][]byte),
	}

	b.Lock()
	b.clients[id] = cli
	b.Unlock()

	err := cli.waitForConnect()

	if err != nil {
		fmt.Println("客户端长时间不发送Connect报文,error:", err)
		return
	}

	go cli.writeLoop()
	err = cli.readLoop()
	if err != nil {
		if !talent.IsEOF(err) {
			fmt.Println("read loop,error:", err)
		}
	}
}
