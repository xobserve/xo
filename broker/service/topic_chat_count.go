package service

import (
	"time"

	"github.com/sunface/talent"
)

type TopicChatCount struct {
	bk    *Broker
	in    chan countMsg
	close chan struct{}
	cache map[string]*chatCount
}

type chatCount struct {
	users      [][]byte
	lastUpdate int64
	count      int
}

var maxChatUsersSyncTime int64 = 120

func (t *TopicChatCount) Init(bk *Broker) {
	t.bk = bk
	t.in = make(chan countMsg, 1000)
	t.close = make(chan struct{}, 1)
	t.cache = make(map[string]*chatCount)
	for {
		select {
		case c := <-t.in:
			now := time.Now().Unix()
			cc, ok := t.cache[talent.Bytes2String(c.topic)]
			if !ok {
				cc = &chatCount{
					users:      t.bk.store.GetChatUsers(c.topic),
					lastUpdate: now,
					count:      c.count,
				}
				t.cache[talent.Bytes2String(c.topic)] = cc
			} else {
				if now-cc.lastUpdate > maxChatUsersSyncTime {
					cc.users = t.bk.store.GetChatUsers(c.topic)
				}
				cc.count += c.count
			}
		case <-time.NewTicker(2 * time.Second).C:

		case <-t.close:
			return
		}
	}

}

func (t *TopicChatCount) Close() {
	t.close <- struct{}{}
}

func (t *TopicChatCount) flush() {

}
