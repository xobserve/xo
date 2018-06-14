package meq

import (
	"github.com/cosmos-gg/meq/proto"
	"github.com/cosmos-gg/meq/proto/mqtt"
)

func (c *Connection) JoinChat(topic []byte) {
	m := mqtt.Publish{
		Header: &mqtt.StaticHeader{
			QOS: 0,
		},
		Topic:   topic,
		Payload: proto.PackJoinChat(topic),
	}
	m.EncodeTo(c.conn)
}

func (c *Connection) LeaveChat(topic []byte) {
	m := mqtt.Publish{
		Header: &mqtt.StaticHeader{
			QOS: 0,
		},
		Topic:   topic,
		Payload: proto.PackLeaveChat(topic),
	}
	m.EncodeTo(c.conn)
}
