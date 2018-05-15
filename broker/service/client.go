package service

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"net"
	"time"

	"github.com/chaingod/talent"
	"github.com/meqio/meq/proto"
	"go.uber.org/zap"
)

// For controlling dynamic buffer sizes.
const (
	headerSize  = 4
	maxBodySize = 65536
)

type client struct {
	cid     uint64 // do not exceeds max(int32)
	conn    net.Conn
	bk      *Broker
	spusher chan []*proto.Message
	gpusher chan pushPacket
	closed  bool
	subs    map[string][]byte
}

func (c *client) readLoop() error {
	defer func() {
		c.closed = true
		// unsub topics
		for topic, group := range c.subs {
			c.bk.store.Unsub([]byte(topic), group, c.cid, c.bk.cluster.peer.name)
			submsg := SubMessage{CLUSTER_UNSUB, []byte(topic), group, c.cid}
			c.bk.cluster.peer.send.GossipBroadcast(submsg)
		}

		if err := recover(); err != nil {
			return
		}
	}()
	// Start read buffer.
	header := make([]byte, headerSize)
	for !c.closed {
		// read header
		var bl uint64
		if _, err := talent.ReadFull(c.conn, header, MAX_IDLE_TIME); err != nil {
			return err
		}
		if bl, _ = binary.Uvarint(header); bl <= 0 || bl >= maxBodySize {
			return fmt.Errorf("packet not valid,header:%v,bl:%v", header, bl)
		}

		// read body
		buf := make([]byte, bl)
		if _, err := talent.ReadFull(c.conn, buf, MAX_IDLE_TIME); err != nil {
			return err
		}
		switch buf[0] {
		case proto.MSG_CONNECT:

		case proto.MSG_PUB: // clients publish the message
			ms, err := proto.UnpackMsgs(buf[1:])
			if err != nil {
				return err
			}

			c.bk.store.Put(ms)
			// push to online clients of this node
			// choose a topic group
			select {
			case c.gpusher <- pushPacket{
				msgs: ms,
			}:
			default:
			}

			// ack the msgs
			var toack [][]byte
			for _, m := range ms {
				if m.QoS == proto.QOS1 {
					toack = append(toack, m.ID)
				}
			}
			msg := proto.PackAck(toack, proto.MSG_PUBACK)
			c.conn.SetWriteDeadline(time.Now().Add(WRITE_DEADLINE))
			c.conn.Write(msg)

		case proto.MSG_SUB: // clients subscribe the specify topic
			topic, group := proto.UnpackSub(buf[1:])
			if topic == nil || len(group) == 0 {
				return errors.New("the sub topic is null")
			}

			c.bk.store.Sub(topic, group, c.cid, c.bk.cluster.peer.name)
			submsg := SubMessage{CLUSTER_SUB, topic, group, c.cid}
			c.bk.cluster.peer.send.GossipBroadcast(submsg)

			c.subs[string(topic)] = group
			if bytes.Compare(topic[:2], MQ_PREFIX) == 0 {
				// push out the stored messages
				msgs := c.bk.store.Get(topic, 0, MSG_NEWEST_OFFSET)
				fmt.Println(len(msgs))
				c.spusher <- msgs
			} else {
				// push out the count of the stored messages
				count := c.bk.store.GetCount(topic)
				msg := proto.PackMsgCount(topic, count)
				c.conn.SetWriteDeadline(time.Now().Add(WRITE_DEADLINE))
				c.conn.Write(msg)
			}
		case proto.MSG_UNSUB: // clients unsubscribe the specify topic
			topic, group := proto.UnpackSub(buf[1:])
			if topic == nil {
				return errors.New("the unsub topic is null")
			}
			c.bk.store.Unsub(topic, group, c.cid, c.bk.cluster.peer.name)
			submsg := SubMessage{CLUSTER_UNSUB, topic, group, c.cid}
			c.bk.cluster.peer.send.GossipBroadcast(submsg)

			delete(c.subs, string(topic))

		case proto.MSG_PUBACK: // clients receive the publish message
			msgids := proto.UnpackAck(buf[1:])
			// ack the message
			c.bk.store.ACK(msgids)
		case proto.MSG_PING: // receive client's 'ping', respond with 'pong'
			msg := proto.PackPong()
			c.conn.SetWriteDeadline(time.Now().Add(WRITE_DEADLINE))
			c.conn.Write(msg)

		case proto.MSG_PULL: // client request to pulls some messages from the specify position
			topic, count, offset := proto.UnPackPullMsg(buf[1:])
			if count > MAX_MESSAGE_PULL_COUNT || count <= 0 {
				return fmt.Errorf("the pull count %d is larger than :%d or equal/smaller than 0", count, MAX_MESSAGE_PULL_COUNT)
			}
			// check the topic is already subed
			_, ok := c.subs[string(topic)]
			if !ok {
				return errors.New("pull messages without subscribe the topic:" + string(topic))
			}
			msgs := c.bk.store.Get(topic, count, offset)
			c.spusher <- msgs
		case proto.MSG_PUB_TIMER, proto.MSG_PUB_RESTORE:
			m := proto.UnpackTimerMsg(buf[1:])
			now := time.Now().Unix()
			// trigger first
			if m.Trigger == 0 {
				if m.Delay != 0 {
					m.Trigger = now + int64(m.Delay)
				}
			}
			if m.Trigger > now {
				c.bk.store.PutTimerMsg(m)
			}

			// ack the timer msg
			msg := proto.PackAck([][]byte{m.ID}, proto.MSG_PUB_TIMER_ACK)
			c.conn.SetWriteDeadline(time.Now().Add(WRITE_DEADLINE))
			c.conn.Write(msg)
		}
	}

	return nil
}

func (c *client) writeLoop() {
	scache := make([]*proto.Message, 0, MAX_MESSAGE_BATCH)
	gcache := make([]*proto.Message, 0, MAX_MESSAGE_BATCH)
	defer func() {
		c.closed = true
		c.conn.Close()

		if len(gcache) != 0 {
			pushOnline(c.cid, c.bk, gcache)
		}

		if err := recover(); err != nil {
			return
		}
	}()

	//@todo if error occurs,return
	for !c.closed || len(c.spusher) > 0 || len(c.gpusher) > 0 {
		select {
		case msgs := <-c.spusher:
			var err error
			if len(msgs)+len(scache) < MAX_MESSAGE_BATCH {
				scache = append(scache, msgs...)
			} else {
				new := append(scache, msgs...)
				batches := (len(new) / MAX_MESSAGE_BATCH) + 1
				for i := 1; i <= batches; i++ {
					if i < batches {
						err = pushOne(c.conn, new[(i-1)*MAX_MESSAGE_BATCH:i*MAX_MESSAGE_BATCH])
					} else {
						err = pushOne(c.conn, new[(i-1)*MAX_MESSAGE_BATCH:])
					}
				}
				scache = scache[:0]
			}
			if err != nil {
				L.Info("push one error", zap.Error(err))
				return
			}
		case p := <-c.gpusher:
			if len(p.msgs)+len(gcache) < MAX_MESSAGE_BATCH {
				gcache = append(gcache, p.msgs...)
			} else {
				msgs := append(gcache, p.msgs...)
				pushOnline(c.cid, c.bk, msgs)
			}
		case <-time.After(500 * time.Millisecond):
			var err error
			if len(scache) > 0 {
				err = pushOne(c.conn, scache)
				scache = scache[:0]
			}

			if len(gcache) > 0 {
				pushOnline(c.cid, c.bk, gcache)
				gcache = gcache[:0]
			}

			if err != nil {
				L.Info("push one error", zap.Error(err))
				return
			}
		}
	}
}

func (c *client) waitForConnect() error {
	header := make([]byte, headerSize)

	var bl uint64
	if _, err := talent.ReadFull(c.conn, header, MAX_IDLE_TIME); err != nil {
		return err
	}

	if bl, _ = binary.Uvarint(header); bl <= 0 || bl >= maxBodySize {
		return errors.New("packet invalid")
	}

	// read body
	buf := make([]byte, bl)
	if _, err := talent.ReadFull(c.conn, buf, MAX_IDLE_TIME); err != nil {
		return err
	}

	if buf[0] != proto.MSG_CONNECT {
		return errors.New("first packet is not MSG_CONNECT")
	}

	// response to client
	msg := proto.PackConnectOK()

	c.conn.SetWriteDeadline(time.Now().Add(5 * WRITE_DEADLINE))
	if _, err := c.conn.Write(msg); err != nil {
		return err
	}

	return nil
}
