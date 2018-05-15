package service

import (
	"github.com/meqio/meq/proto"
	"github.com/weaveworks/mesh"
)

type Storage interface {
	Init()
	Close()

	Put([]*proto.Message)
	ACK([][]byte)

	Get([]byte, int, []byte) []*proto.Message
	GetCount([]byte) int

	Flush()

	Sub([]byte, []byte, uint64, mesh.PeerName)
	Unsub([]byte, []byte, uint64, mesh.PeerName)

	PutTimerMsg(*proto.TimerMsg)
	GetTimerMsg() []*proto.Message
}
