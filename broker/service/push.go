package service

import (
	"net"
	"time"

	"github.com/meqio/meq/proto"
)

type pushPacket struct {
	msgs []*proto.Message
	cids []uint64
}

func pushOnline(from uint64, bk *Broker, m proto.Message, cids []uint64) {
	msg := proto.PackMsgs([]proto.Message{m}, proto.MSG_PUB)
	for _, cid := range cids {
		if cid == from {
			continue
		}
		bk.Lock()
		c, ok := bk.clients[cid]
		bk.Unlock()
		if !ok { // clients offline,delete it
			bk.Lock()
			delete(bk.clients, cid)
			bk.Unlock()
		} else { // push to clients
			c.conn.SetWriteDeadline(time.Now().Add(WRITE_DEADLINE))
			c.conn.Write(msg)
		}
	}
}

func pushOne(conn net.Conn, m proto.Message) error {
	msg := proto.PackMsgs([]proto.Message{m}, proto.MSG_PUB)
	conn.SetWriteDeadline(time.Now().Add(MAX_IDLE_TIME * time.Second))
	_, err := conn.Write(msg)
	return err
}
