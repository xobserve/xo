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
	"fmt"

	"github.com/cosmos-gg/meq/proto"
	"github.com/cosmos-gg/meq/proto/mqtt"
)

func (c *Connection) PullMsgs(topic []byte, count int, offset []byte) error {
	// check the topic is push or pull prop
	// only the pull prop can continue
	sub, ok := c.subs[string(topic)]
	if !ok {
		// subscribe to the topic failed
		return errors.New("subscribe topic failed,please re-subscribe")
	}

	if !sub.acked {
		return errors.New("subscribe topic failed,please re-subscribe")
	}

	if offset == nil {
		offset = proto.MSG_NEWEST_OFFSET
	}

	if count <= 0 {
		return errors.New("messages count cant below 0")
	}

	if count > proto.MAX_PULL_COUNT {
		return fmt.Errorf("messages count cant larger than %d", proto.MAX_PULL_COUNT)
	}

	// 拉取最新消息
	m := mqtt.Publish{
		Header: &mqtt.StaticHeader{
			QOS: 0,
		},
		Topic:   topic,
		Payload: proto.PackPullMsg(count, offset),
	}
	m.EncodeTo(c.conn)

	return nil
}
