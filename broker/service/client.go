package service

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"net"
	"time"
)

const (
	MSG_PUB        = 'a'
	MSG_SUB        = 'b'
	MSG_PUBACK     = 'c'
	MSG_PING       = 'd'
	MSG_PONG       = 'e'
	MSG_UNSUB      = 'f'
	MSG_COUNT      = 'g'
	MSG_PULL       = 'h'
	MSG_CONNECT    = 'i'
	MSG_CONNECT_OK = 'j'
)

// For controlling dynamic buffer sizes.
const (
	headerSize  = 4
	maxBodySize = 65536
)

type client struct {
	cid    uint64
	conn   net.Conn
	bk     *Broker
	pusher chan Message
	closed bool
	subs   map[string]struct{}
}

type Message struct {
	ID      []byte
	Topic   []byte
	Payload []byte
	Acked   bool
}

func (c *client) readLoop() error {
	defer func() {
		c.closed = true
		if err := recover(); err != nil {
			fmt.Println("panic happened:", err)
			return
		}
	}()
	// Start read buffer.
	header := make([]byte, headerSize)
	for {
		// read header
		var bl uint64
		c.conn.SetReadDeadline(time.Now().Add(MAX_IDLE_TIME))
		if _, err := c.conn.Read(header); err != nil {
			return err
		}
		if bl, _ = binary.Uvarint(header); bl <= 0 || bl >= maxBodySize {
			return errors.New("packet not valid")
		}

		// read body
		buf := make([]byte, bl)
		if _, err := c.conn.Read(buf); err != nil {
			return err
		}

		switch buf[0] {
		case MSG_CONNECT:

		case MSG_PUB: // clients publish the message
			topic, payload, msgid := c.parsePub(buf)
			if topic == nil {
				return errors.New("the pub topic is null")
			}
			c.bk.store.Put(&Message{msgid, topic, payload, false})
			// push to online clients
			c.pusher <- Message{msgid, topic, payload, false}
		case MSG_SUB: // clients subscribe the specify topic
			topic := c.parseSub(buf)
			if topic == nil {
				return errors.New("the sub topic is null")
			}
			c.bk.store.Sub(topic, c.cid)
			c.subs[string(topic)] = struct{}{}
			if bytes.Compare(topic[:2], MQ_PREFIX) == 0 {
				// push out the stored messages
				msgs := c.bk.store.Get(topic, -1, []byte{})
				for _, m := range msgs {
					c.pusher <- *m
				}
			} else {
				// push out the count of the stored messages
				count := c.bk.store.GetCount(topic)
				msg := make([]byte, 4+1+2+len(topic)+4)
				binary.PutUvarint(msg[:4], uint64(1+2+len(topic)+4))
				msg[4] = MSG_COUNT
				binary.PutUvarint(msg[5:7], uint64(len(topic)))
				copy(msg[7:7+len(topic)], topic)
				binary.PutUvarint(msg[7+len(topic):11+len(topic)], uint64(count))

				c.conn.SetWriteDeadline(time.Now().Add(WRITE_DEADLINE))
				c.conn.Write(msg)
			}
		case MSG_UNSUB: // clients unsubscribe the specify topic
			topic := c.parseSub(buf)
			if topic == nil {
				return errors.New("the unsub topic is null")
			}
			c.bk.store.Unsub(topic, c.cid)
			delete(c.subs, string(topic))

		case MSG_PUBACK: // clients receive the publish message
			msgid := c.parseAck(buf)
			// ack the message
			c.bk.store.ACK(msgid)
		case MSG_PING: // receive client's 'ping', respond with 'pong'
			msg := make([]byte, 5)
			binary.PutUvarint(msg[:4], 1)
			msg[4] = MSG_PONG
			c.conn.SetWriteDeadline(time.Now().Add(WRITE_DEADLINE))
			c.conn.Write(msg)

		case MSG_PULL: // client request to pulls some messages from the specify position
			topic, count, offset := c.parsePull(buf)
			// check the topic is already subed
			_, ok := c.subs[string(topic)]
			if !ok {
				return errors.New("ull messages without subscribe the topic:" + string(topic))
			}
			msgs := c.bk.store.Get(topic, count, offset)
			for _, m := range msgs {
				c.pusher <- *m
			}
		}
	}
}

func (c *client) writeLoop() {
	defer func() {
		if err := recover(); err != nil {
			return
		}
	}()

	for !c.closed || len(c.pusher) > 0 {
		select {
		case msg := <-c.pusher:
			c.Push(msg)
		case <-time.After(2 * time.Second):
		}
	}
}

func (c *client) waitForConnect() error {
	header := make([]byte, headerSize)

	var bl uint64
	c.conn.SetReadDeadline(time.Now().Add(MAX_IDLE_TIME))
	if _, err := c.conn.Read(header); err != nil {
		return err
	}

	if bl, _ = binary.Uvarint(header); bl <= 0 || bl >= maxBodySize {
		return errors.New("packet invalid")
	}

	// read body
	buf := make([]byte, bl)
	if _, err := c.conn.Read(buf); err != nil {
		return err
	}

	if buf[0] != MSG_CONNECT {
		return errors.New("first packet is not MSG_CONNECT")
	}

	// response to client
	msg := make([]byte, 5)
	binary.PutUvarint(msg[:4], 1)
	msg[4] = MSG_CONNECT_OK

	c.conn.SetWriteDeadline(time.Now().Add(5 * WRITE_DEADLINE))
	if _, err := c.conn.Write(msg); err != nil {
		return err
	}

	return nil
}
