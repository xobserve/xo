package service

import (
	"net"
	"time"

	"github.com/meqio/proto"
	"go.uber.org/zap"
)

type pushPacket struct {
	msgs []*proto.Message
	cids []uint64
}

func pushOnline(from uint64, bk *Broker, msgs []*proto.Message) {
	local, outer := bk.router.FindRoutes(msgs)
	for s, ms := range local {
		cid := s.Cid
		if from == cid {
			continue
		}
		msg := proto.PackMsgs(ms, proto.MSG_PUB)
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
	bk.router.route(outer)
}

func pushOne(conn net.Conn, m []*proto.Message) error {
	msg := proto.PackMsgs(m, proto.MSG_PUB)
	conn.SetWriteDeadline(time.Now().Add(MAX_IDLE_TIME * time.Second))
	_, err := conn.Write(msg)
	return err
}
