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
package meq

import (
	"errors"
	"time"

	"github.com/meqio/meq/proto"
	"github.com/meqio/meq/proto/mqtt"
)

func (c *Connection) Subscribe(topic []byte) error {
	_, err := proto.ParseTopic(topic, true)
	if err != nil {
		return err
	}
	sub := &sub{}
	hc := make(chan *proto.PubMsg, 10000)
	sub.ch = hc
	c.subs[string(topic)] = sub

	c.msgid++
	mid := c.msgid
	c.subid[mid] = [][]byte{topic}

	submsg := mqtt.Subscribe{
		MessageID:     c.msgid,
		Subscriptions: []mqtt.TopicQOSTuple{mqtt.TopicQOSTuple{1, topic}},
	}

	submsg.EncodeTo(c.conn)

	// wait for subscribe ack,at max 10 seconds
	n := 0
	for !sub.acked {
		if n > 10 {
			return errors.New("subscribe failed")
		}
		time.Sleep(500 * time.Millisecond)
		n++
	}
	return nil
}
