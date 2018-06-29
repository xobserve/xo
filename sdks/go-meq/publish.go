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
	"github.com/meqio/meq/proto"
	"github.com/meqio/meq/proto/mqtt"
)

func (c *Connection) Publish(msgs []*proto.PubMsg) error {
	msg := mqtt.Publish{
		Header: &mqtt.StaticHeader{
			QOS: 0,
		},
		Payload: proto.PackPubBatch(msgs, proto.MSG_PUB_BATCH),
	}
	_, err := msg.EncodeTo(c.conn)
	return err
}

func (c *Connection) Broadcast(msgs []*proto.PubMsg) error {
	msg := mqtt.Publish{
		Header: &mqtt.StaticHeader{
			QOS: 0,
		},
		Payload: proto.PackPubBatch(msgs, proto.MSG_BROADCAST),
	}
	_, err := msg.EncodeTo(c.conn)
	return err
}
