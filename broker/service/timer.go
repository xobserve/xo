package service

import (
	"sync"
	"time"
)

type Timer struct {
	bk *Broker
	sync.RWMutex
	close chan struct{}
}

type TimerMessage struct {
	ID      []byte
	Topic   []byte
	Payload []byte
	TS      int64
	Count   int8
	Base    int8
	Power   int8
}

func (t *Timer) Init() {
	t.close = make(chan struct{}, 1)
	go func() {
		t.bk.wg.Add(1)
		defer t.bk.wg.Done()
		for {
			select {
			case <-time.NewTicker(2 * time.Second).C:
				msgs := t.bk.store.GetTimerMsg()
				if len(msgs) > 0 {
					pushOnline(0, t.bk, msgs)
				}
			case <-t.close:
				return
			}
		}
	}()
}

func (t *Timer) Close() {
	t.close <- struct{}{}
}
