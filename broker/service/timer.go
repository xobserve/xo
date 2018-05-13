package service

import (
	"sync"
)

type Timer struct {
	bk *Broker
	sync.RWMutex
}

func (t *Timer) Init() {
	go func() {

	}()
}

func (t *Timer) Close() {

}
