package service

import (
	"net"
	"time"

	"github.com/meqio/meq/proto"
	"go.uber.org/zap"
)

type pushPacket struct {
	msgs []*proto.Message
	cids []uint64
}

func pushOnline(from uint64, bk *Broker, m []*proto.Message, cid uint64) {
	if from == cid {
		return
	}
	msg := proto.PackMsgs(m, proto.MSG_PUB)
	bk.Lock()
	c, ok := bk.clients[cid]
	bk.Unlock()
	if !ok { // clients offline,delete it
		bk.Lock()
		delete(bk.clients, cid)
		bk.Unlock()
	} else { // push to clients
		c.conn.SetWriteDeadline(time.Now().Add(WRITE_DEADLINE))
		_, err := c.conn.Write(msg)
		if err != nil {
			L.Info("push online error", zap.Error(err))
		}
	}
}

func pushOne(conn net.Conn, m []*proto.Message) error {
	msg := proto.PackMsgs(m, proto.MSG_PUB)
	conn.SetWriteDeadline(time.Now().Add(MAX_IDLE_TIME * time.Second))
	_, err := conn.Write(msg)
	return err
}
