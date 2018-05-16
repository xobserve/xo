package main

import (
	"encoding/binary"
	"fmt"
	"net"
	"sync"
	"sync/atomic"
	"time"

	"github.com/chaingod/talent"
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
			cache := make([]*proto.Message, 0, 1000)
			for {
				if n > 200000 {
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
				if len(cache) < 500 {
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

		go func(conn net.Conn) {
			for {
				header := make([]byte, 4)
				_, err := talent.ReadFull(conn, header, 0)
				if err != nil {
					panic(err)
				}

				hl, _ := binary.Uvarint(header)
				if hl <= 0 {
					fmt.Println("here1111:", header, hl)
					break
				}
				msg := make([]byte, hl)
				talent.ReadFull(conn, msg, 0)
			}
		}(conn)
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
