package service

import "github.com/meqio/meq/proto"

type Storer interface {
	Init()
	Put([]*proto.Message)
	Get([]byte, int, []byte) []*proto.Message
	GetCount([]byte) int
	ACK([]byte)
	Flush()
	Sub([]byte, []byte, uint64)
	Unsub([]byte, []byte, uint64)
	FindRoutes([]byte) ([]uint64, []Sess)
	PutTimerMsg(*proto.TimerMsg)
	ScanTimerMsg()
}
