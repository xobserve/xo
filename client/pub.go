package main

import (
	"fmt"
	"net"
	"sync"
	"sync/atomic"
	"time"

	"github.com/meqio/meq/proto"
)

func pub(conns []net.Conn) {
	wg := &sync.WaitGroup{}
	wg.Add(len(conns))

	var pushed int64
	for i, conn := range conns {
		go func(i int, conn net.Conn) {
			defer wg.Done()
			n := 1
			cache := make([]*proto.Message, 0, 100)
			for {
				if n > 50000 {
					break
				}
				// 27
				m := &proto.Message{
					ID:      []byte(fmt.Sprintf("%d-%010d", i, n)),
					Topic:   []byte(topic),
					Payload: []byte("123456789"),
					Type:    1,
					QoS:     1,
				}
				if len(cache) < 200 {
					cache = append(cache, m)
				} else {
					cache = append(cache, m)
					msg := proto.PackMsgs(cache, proto.MSG_PUB)
					_, err := conn.Write(msg)
					if err != nil {
						panic(err)
					}
					atomic.AddInt64(&pushed, int64(len(cache)))
					cache = cache[:0]
				}
				n++
			}
		}(i, conn)
	}

	wg.Wait()

	fmt.Println("共计推送消息：", pushed)
}

func pubTimer(conn net.Conn) {

	m := proto.TimerMsg{
		ID:      []byte(fmt.Sprintf("%010d", 1)),
		Topic:   []byte(topic),
		Payload: []byte("1234567891234567"),
		Trigger: time.Now().Add(60 * time.Second).Unix(),
		Delay:   30,
	}
	msg := proto.PackTimerMsg(&m, proto.MSG_PUB_RESTORE)
	_, err := conn.Write(msg)
	if err != nil {
		panic(err)
	}

}
