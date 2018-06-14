package meq

import (
	"errors"
	"time"

	"github.com/cosmos-gg/meq/proto"
	"github.com/cosmos-gg/meq/proto/mqtt"
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
