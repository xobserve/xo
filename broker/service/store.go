package service

import "github.com/meqio/meq/proto"

type Storer interface {
	Init()
	Close()
	Put([]*proto.Message)
	Get([]byte, int, []byte) []*proto.Message
	GetCount([]byte) int
	ACK([][]byte)
	Flush()
	Sub([]byte, []byte, uint64)
	Unsub([]byte, []byte, uint64)
	FindRoutes([]*proto.Message) (map[Sess][]*proto.Message, map[Sess][]*proto.Message)
	PutTimerMsg(*proto.TimerMsg)
	ScanTimerMsg()
}
