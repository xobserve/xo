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
