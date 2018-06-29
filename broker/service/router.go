//  Copyright © 2018 Sunface <CTO@188.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package service

import (
	"encoding/binary"
	"sync"

	"github.com/meqio/meq/proto"
	"github.com/weaveworks/mesh"
	"go.uber.org/zap"
)

type Router struct {
	bk *Broker
	sync.RWMutex
}

type RouterTarget struct {
	Addr string
	Cid  uint64
}

func (r *Router) Init() {

}

func (r *Router) Close() {

}

// first byte: command
// second four byte : cid
// other : msg body
func (r *Router) recvRoute(src mesh.PeerName, buf []byte) {
	cid := uint64(binary.LittleEndian.Uint32(buf[:4]))
	cmd := buf[4]

	r.RLock()
	c, ok := r.bk.clients[cid]
	r.RUnlock()
	if !ok {
		return
	}

	switch cmd {
	case proto.MSG_PUB_BATCH:
		msgs, err := proto.UnpackPubBatch(buf[5:])
		if err != nil {
			L.Warn("route process pub batch error", zap.Error(err))
			return
		}
		c.msgSender <- msgs
	case proto.MSG_JOIN_CHAT: // notify someone has join the chat
		notifyOne(c.conn, buf[5:])
	}
}

// notify!!
// the first byte of m must be command byte
func (r *Router) route(s Sub, m []byte) {
	msg := make([]byte, 9+len(m))
	// 4 bytes header
	binary.PutUvarint(msg[:4], 5+uint64(len(m)))
	// 1 byte command
	msg[4] = CLUSTER_MSG_ROUTE
	// cid
	binary.LittleEndian.PutUint32(msg[5:9], uint32(s.Cid))
	// body
	copy(msg[9:], m)
	//@todo
	// async + batch,current implementation will block the client's read loop
	r.bk.cluster.peer.send.GossipUnicast(s.Addr, msg)
}
