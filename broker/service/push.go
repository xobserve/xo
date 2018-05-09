package service

import (
	"encoding/binary"
	"time"
)

func (c *client) Push(m Message) {
	t := m.Topic
	msgid := m.ID
	payload := m.Payload
	c.bk.Lock()
	cids := c.bk.store.FindConnByTopic(t)
	c.bk.Unlock()

	// header
	msg := make([]byte, 1+4+2+len(msgid)+4+len(payload)+1)
	binary.PutUvarint(msg[:4], uint64(1+2+len(msgid)+4+len(payload)+1))
	msg[4] = MSG_PUB
	// msgid
	binary.PutUvarint(msg[5:7], uint64(len(msgid)))
	copy(msg[7:7+len(msgid)], msgid)

	// payload
	binary.PutUvarint(msg[7+len(msgid):11+len(msgid)], uint64(len(payload)))
	copy(msg[11+len(msgid):11+len(msgid)+len(payload)], payload)

	// acked
	if m.Acked {
		msg[11+len(msgid)+len(payload)] = '1'
	} else {
		msg[11+len(msgid)+len(payload)] = '0'
	}

	for _, cid := range cids {
		c.bk.Lock()
		conn, ok := c.bk.clients[cid]
		c.bk.Unlock()
		if !ok { // clients offline,delete it
			c.bk.Lock()
			delete(c.bk.clients, cid)
			c.bk.Unlock()
		} else { // push to clients
			conn.SetWriteDeadline(time.Now().Add(WRITE_DEADLINE))
			conn.Write(msg)
		}
	}
}
