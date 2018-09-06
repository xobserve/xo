//  Copyright © 2018 Sunface <CTO@188.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
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
		tc := time.NewTicker(2 * time.Second).C
		for {
			select {
			case <-tc:
				msgs := t.bk.store.QueryTM()
				if len(msgs) > 0 {
					publishOnline(0, t.bk, msgs, false)
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
