package main

import (
	"fmt"
	"sync"
	"sync/atomic"

	"github.com/cosmos-gg/meq/proto"
	meq "github.com/cosmos-gg/meq/sdks/go-meq"
)

func pub(conns []*meq.Connection) {
	wg := &sync.WaitGroup{}
	wg.Add(len(conns))

	var pushed int64
	for i, conn := range conns {
		go func(i int, conn *meq.Connection) {
			defer wg.Done()
			n := 1
			cache := make([]*proto.PubMsg, 0, 10000)
			for {
				if n > 10 {
					break
				}
				// 27
				m := &proto.PubMsg{
					RawID:   []byte("1234"),
					ID:      []byte(""),
					Topic:   []byte(topic),
					Payload: []byte("我是😯"),
					Type:    1,
					QoS:     1,
				}
				if len(cache) < 2 {
					cache = append(cache, m)
				} else {
					cache = append(cache, m)
					conn.Publish(cache)
					atomic.AddInt64(&pushed, int64(len(cache)))
					cache = cache[:0]
				}
				n++
			}
		}(i, conn)
		wg.Wait()

		fmt.Println("共计推送消息：", pushed)
	}
}
