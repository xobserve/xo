package meq

import (
	"github.com/cosmos-gg/meq/proto"
	"github.com/cosmos-gg/meq/proto/mqtt"
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
