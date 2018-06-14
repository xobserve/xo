package service

import (
	"testing"

	"github.com/cosmos-gg/meq/proto"
	"github.com/stretchr/testify/assert"
	"github.com/weaveworks/mesh"
)

var mockSubs = []SubData{
	SubData{[]byte("/test/g1/a1/b1"), 1, mesh.PeerName(1)},
	SubData{[]byte("/test/g2/a1/b1/c1"), 2, mesh.PeerName(2)},
	SubData{[]byte("/test/g1/a1/b1/c1"), 3, mesh.PeerName(1)},
	SubData{[]byte("/test/g2/a1/b1/c1"), 4, mesh.PeerName(2)},
	SubData{[]byte("/test/g1/a1/b1/c1/d1/e1"), 5, mesh.PeerName(1)},
	SubData{[]byte("/test/g1/a1/b1/c1/d1/e2"), 5, mesh.PeerName(2)},
	SubData{[]byte("/test/g2/a1/b2/c1"), 6, mesh.PeerName(2)},
	SubData{[]byte("/test/g1/a1/b2/c2"), 7, mesh.PeerName(2)},
	SubData{[]byte("/test/g2/a2/b1/c1"), 8, mesh.PeerName(1)},
}

func TestRouteMsgPackUnpack(t *testing.T) {
	var cid uint64 = 1000
	packed := packRouteMsgs(mockMsgs, proto.MSG_PUB, cid)
	unpacked, ncid, err := unpackRouteMsgs(packed[5:])

	assert.NoError(t, err)
	assert.Equal(t, mockMsgs, unpacked)
	assert.Equal(t, cid, ncid)
}

func BenchmarkRouteMsgPack(b *testing.B) {
	b.ReportAllocs()
	b.ResetTimer()

	var cid uint64 = 1000
	packed := packRouteMsgs(mockMsgs, proto.MSG_PUB, cid)
	for i := 0; i < b.N; i++ {
		unpackRouteMsgs(packed[5:])
	}
}

func BenchmarkRouteMsgUnpack(b *testing.B) {
	b.ReportAllocs()
	b.ResetTimer()

	var cid uint64 = 1000
	for i := 0; i < b.N; i++ {
		packRouteMsgs(mockMsgs, proto.MSG_PUB, cid)
	}
}
