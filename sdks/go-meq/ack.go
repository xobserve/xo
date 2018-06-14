package meq

import (
	"errors"
	"fmt"

	"github.com/cosmos-gg/meq/proto"
	"github.com/cosmos-gg/meq/proto/mqtt"
)

func (c *Connection) ReduceCount(topic []byte, count int) error {
	sub, ok := c.subs[string(topic)]
	if !ok {
		// subscribe to the topic failed
		return errors.New("subscribe topic failed,please re-subscribe")
	}

	if !sub.acked {
		return errors.New("subscribe topic failed,please re-subscribe")
	}

	if count <= 0 && count != proto.REDUCE_ALL_COUNT {
		return fmt.Errorf("ack count cant below 0,except count == proto.ACK_ALL_COUNT")
	}

	if count > proto.MAX_PULL_COUNT {
		return fmt.Errorf("ack count cant greater than proto.MAX_PULL_COUNT")
	}

	msg := mqtt.Publish{
		Header: &mqtt.StaticHeader{
			QOS: 0,
		},
		Topic:   topic,
		Payload: proto.PackReduceCount(count),
	}
	msg.EncodeTo(c.conn)

	return nil
}
