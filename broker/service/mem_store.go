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
	"bytes"
	"sync"
	"time"

	"github.com/sunface/talent"
	"github.com/weaveworks/mesh"

	"github.com/cosmos-gg/meq/proto"
)

type MemStore struct {
	In        chan []*proto.PubMsg
	DB        map[string]map[string]*proto.PubMsg
	DBIndex   map[string][]string
	DBIDIndex map[string]string

	chatroom   map[string]map[string]int
	topicCount map[string]int

	timerDB []*proto.TimerMsg

	bk    *Broker
	cache []*proto.PubMsg

	readCache []proto.Ack

	//cluster
	send          mesh.Gossip
	pn            mesh.PeerName
	msgSyncCache  []*proto.PubMsg
	readSyncCache []proto.Ack

	sync.RWMutex
}

const (
	MaxCacheLength    = 10000
	MaxMemFlushLength = 100

	MaxSyncMsgLen = 1000
	MaxSyncAckLen = 1000
)

const (
	MEM_MSG_ADD = 'a'
	MEM_MSG_ACK = 'b'
)

/*------------------------------Storage interface implemented------------------------*/

func (ms *MemStore) Init() {
	ms.In = make(chan []*proto.PubMsg, MaxCacheLength)
	ms.DB = make(map[string]map[string]*proto.PubMsg)
	ms.DBIndex = make(map[string][]string)
	ms.DBIDIndex = make(map[string]string)
	ms.cache = make([]*proto.PubMsg, 0, MaxCacheLength)
	ms.msgSyncCache = make([]*proto.PubMsg, 0, MaxSyncMsgLen)
	ms.readSyncCache = make([]proto.Ack, 0, MaxSyncAckLen)
	ms.chatroom = make(map[string]map[string]int)
	ms.topicCount = make(map[string]int)
	go func() {
		ms.bk.wg.Add(1)
		defer ms.bk.wg.Done()
		for ms.bk.running {
			msgs := <-ms.In
			ms.Lock()
			ms.cache = append(ms.cache, msgs...)
			ms.Unlock()
		}
	}()

	go func() {
		ms.bk.wg.Add(1)
		defer ms.bk.wg.Done()

		for ms.bk.running {
			time.Sleep(100 * time.Millisecond)
			ms.flush()
		}
	}()

	go func() {
		ms.bk.wg.Add(1)
		defer ms.bk.wg.Done()

		for ms.bk.running {
			time.Sleep(2 * time.Second)
			ms.flushRead()
		}
	}()

	go func() {
		readTimer := time.NewTicker(200 * time.Millisecond).C
		msgTimer := time.NewTicker(200 * time.Millisecond).C
		for {
			select {
			case <-readTimer: // sync acks
				if len(ms.readSyncCache) > 0 {
					ms.Lock()
					m := proto.PackAck(ms.readSyncCache, MEM_MSG_ACK)
					ms.readSyncCache = make([]proto.Ack, 0, MAX_CHANNEL_LEN)
					ms.Unlock()

					ms.send.GossipBroadcast(MemMsg(m))
				}
			case <-msgTimer: // sync msgs
				if len(ms.msgSyncCache) > 0 {
					ms.Lock()
					m := proto.PackPubBatch(ms.msgSyncCache, MEM_MSG_ADD)
					ms.msgSyncCache = make([]*proto.PubMsg, 0, MAX_CHANNEL_LEN)
					ms.Unlock()

					ms.send.GossipBroadcast(MemMsg(m))
				}
			}
		}
	}()
}

func (ms *MemStore) Close() {
	close(ms.In)
}

func (ms *MemStore) Store(msgs []*proto.PubMsg) {
	if len(msgs) > 0 {
		var nmsgs []*proto.PubMsg
		for _, msg := range msgs {
			if msg.QoS == proto.QOS1 {
				// qos 1 need to be persistent
				nmsgs = append(nmsgs, msg)
			}
		}

		if len(nmsgs) > 0 {
			ms.In <- nmsgs

			ms.Lock()
			ms.msgSyncCache = append(ms.msgSyncCache, msgs...)
			ms.Unlock()
		}
	}
}

func (ms *MemStore) MarkRead(topic []byte, msgids [][]byte) {
	acks := make([]proto.Ack, len(msgids))
	for i, id := range msgids {
		acks[i] = proto.Ack{topic, id}
	}

	if len(msgids) > 0 {
		ms.Lock()
		ms.readCache = append(ms.readCache, acks...)
		ms.readSyncCache = append(ms.readSyncCache, acks...)
		ms.Unlock()
	}
}

func (ms *MemStore) UpdateUnreadCount(topic []byte, user []byte, isAdd bool, count int) {
	ms.Lock()
	defer ms.Unlock()
	tp := proto.GetTopicType(topic)
	if tp == proto.TopicTypeNormal {
		c, ok := ms.topicCount[talent.Bytes2String(topic)]
		if !isAdd {
			if ok {
				if count == proto.REDUCE_ALL_COUNT {
					ms.topicCount[talent.Bytes2String(topic)] = 0
				} else {
					if c-count > 0 {
						ms.topicCount[talent.Bytes2String(topic)] = c - count
					} else {
						ms.topicCount[talent.Bytes2String(topic)] = 0
					}
				}
			}
		} else {
			if !ok {
				ms.topicCount[talent.Bytes2String(topic)] = count
			} else {
				ms.topicCount[talent.Bytes2String(topic)] = c + count
			}
		}
	} else {
		t, ok := ms.chatroom[talent.Bytes2String(topic)]
		if !ok {
			return
		}
		if !isAdd {
			_, ok := t[talent.Bytes2String(user)]
			if ok {
				t[talent.Bytes2String(user)] = 0
			}
		} else {
			for u, c := range t {
				t[u] = c + count
			}
		}
	}
}

func (ms *MemStore) Query(t []byte, count int, offset []byte, acked bool) []*proto.PubMsg {
	topic := string(t)

	ms.Lock()
	defer ms.Unlock()
	msgs := ms.DB[topic]
	index := ms.DBIndex[topic]

	var newMsgs []*proto.PubMsg

	if bytes.Compare(offset, proto.MSG_NEWEST_OFFSET) == 0 {
		if count == 0 { // get all messages
			for i := len(index) - 1; i >= 0; i-- {
				msg := msgs[index[i]]
				newMsgs = append(newMsgs, msg)
			}

			return newMsgs
		}

		c := 0

		for i := len(index) - 1; i >= 0; i-- {
			if c >= count {
				break
			}
			msg := msgs[index[i]]
			newMsgs = append(newMsgs, msg)
			c++
		}

	} else {
		// find the position of the offset
		pos := -1
		ot := string(offset)
		for i, id := range index {
			if id == ot {
				pos = i
			}
		}

		// can't find the message  or the message is the last one
		// just return empty
		if pos == -1 || pos == len(index)-1 {
			return newMsgs
		}

		if count == 0 {
			// msg push/im pull messages before offset
			for i := pos - 1; i >= 0; i-- {
				msg := msgs[index[i]]
				newMsgs = append(newMsgs, msg)
			}
		} else {
			c := 0
			// msg push/im pull messages before offset
			for i := pos - 1; i >= 0; i-- {
				if c >= count {
					break
				}
				msg := msgs[index[i]]
				newMsgs = append(newMsgs, msg)
				c++
			}
		}
	}

	return newMsgs
}

func (ms *MemStore) UnreadCount(topic []byte, user []byte) int {
	ms.RLock()
	defer ms.RUnlock()

	tp := proto.GetTopicType(topic)
	if tp == proto.TopicTypeNormal {
		return ms.topicCount[talent.Bytes2String(topic)]
	} else {
		t, ok := ms.chatroom[talent.Bytes2String(topic)]
		if !ok {
			return 0
		}

		return t[talent.Bytes2String(user)]
	}
}

func (ms *MemStore) StoreTM(m *proto.TimerMsg) {
	ms.Lock()
	ms.timerDB = append(ms.timerDB, m)
	ms.Unlock()
}

func (ms *MemStore) QueryTM() []*proto.PubMsg {
	now := time.Now().Unix()

	var newM []*proto.TimerMsg
	var msgs []*proto.PubMsg
	ms.Lock()
	for _, m := range ms.timerDB {
		if m.Trigger <= now {
			msgs = append(msgs, &proto.PubMsg{m.ID, m.ID, m.Topic, m.Payload, false, proto.TIMER_MSG, 1, 0, nil, nil})
		} else {
			newM = append(newM, m)
		}
	}
	ms.timerDB = newM
	ms.Unlock()

	ms.Store(msgs)

	return msgs
}

func (ms *MemStore) JoinChat(topic []byte, user []byte) error {
	ms.Lock()
	defer ms.Unlock()

	t, ok := ms.chatroom[talent.Bytes2String(topic)]
	if !ok {
		ms.chatroom[talent.Bytes2String(topic)] = map[string]int{
			talent.Bytes2String(user): 0,
		}
	} else {
		_, ok := t[talent.Bytes2String(user)]
		if !ok {
			t[talent.Bytes2String(user)] = 0
		}
	}

	return nil
}

func (ms *MemStore) LeaveChat(topic []byte, user []byte) error {
	ms.Lock()
	defer ms.Unlock()

	t, ok := ms.chatroom[talent.Bytes2String(topic)]
	if ok {
		delete(t, talent.Bytes2String(user))
	}

	return nil
}

func (ms *MemStore) GetChatUsers(topic []byte) [][]byte {
	ms.Lock()
	defer ms.Unlock()

	users := make([][]byte, 0)
	t, ok := ms.chatroom[talent.Bytes2String(topic)]
	if ok {
		for u := range t {
			users = append(users, talent.String2Bytes(u))
		}
	}

	return users
}

func (ms *MemStore) Del(topic []byte, msgid []byte) error {
	return nil
}

// Admin part
func (ms *MemStore) SaveAdminInfo(tp int, data interface{}) {

}

func (ms *MemStore) QueryAdminInfo(tp int) interface{} {
	return nil
}

/*--------------------------------Internal funcitons--------------------------------*/
func (ms *MemStore) flush() {
	temp := ms.cache
	if len(temp) > 0 {
		for _, msg := range temp {
			ms.RLock()
			if _, ok := ms.DBIDIndex[talent.Bytes2String(msg.ID)]; ok {
				ms.RUnlock()
				continue
			}
			ms.RUnlock()

			t := talent.Bytes2String(msg.Topic)
			ms.Lock()
			_, ok := ms.DB[t]
			if !ok {
				ms.DB[t] = make(map[string]*proto.PubMsg)
			}

			//@performance
			ms.DB[t][talent.Bytes2String(msg.ID)] = msg
			ms.DBIndex[t] = append(ms.DBIndex[t], talent.Bytes2String(msg.ID))
			ms.DBIDIndex[talent.Bytes2String(msg.ID)] = t
			ms.topicCount[t]++
			ms.Unlock()
		}
		ms.Lock()
		ms.cache = ms.cache[len(temp):]
		ms.Unlock()
	} else {
		// rejust the cache cap length
		ms.Lock()
		if len(ms.cache) == 0 && cap(ms.cache) != MaxCacheLength {
			ms.cache = make([]*proto.PubMsg, 0, MaxCacheLength)
		}
		ms.Unlock()
	}
}

func (ms *MemStore) flushRead() {
	if len(ms.readCache) == 0 {
		return
	}

	temp := ms.readCache
	for _, ack := range temp {
		// lookup topic
		ms.RLock()
		t, ok := ms.DBIDIndex[string(ack.Msgid)]
		if !ok {
			ms.RUnlock()
			// newCache = append(newCache, msgid)
			continue
		}

		// set message status to acked
		msg := ms.DB[t][string(ack.Msgid)]
		ms.RUnlock()
		msg.Acked = true
	}

	ms.Lock()
	ms.readCache = ms.readCache[len(temp):]
	ms.Unlock()
}

/* -------------------------- cluster part -----------------------------------------------*/
// Return a copy of our complete state.
func (ms *MemStore) Gossip() (complete mesh.GossipData) {
	return
}

// Merge the gossiped data represented by buf into our state.
// Return the state information that was modified.
func (ms *MemStore) OnGossip(buf []byte) (delta mesh.GossipData, err error) {
	return
}

// Merge the gossiped data represented by buf into our state.
// Return the state information that was modified.
func (ms *MemStore) OnGossipBroadcast(src mesh.PeerName, buf []byte) (received mesh.GossipData, err error) {
	command := buf[4]
	switch command {
	case MEM_MSG_ADD:
		msgs, _ := proto.UnpackPubBatch(buf[5:])
		ms.In <- msgs

	case MEM_MSG_ACK:
		msgids := proto.UnpackAck(buf[5:])
		ms.Lock()
		for _, msgid := range msgids {
			ms.readCache = append(ms.readCache, msgid)
		}
		ms.Unlock()
	}
	return
}

// Merge the gossiped data represented by buf into our state.
func (ms *MemStore) OnGossipUnicast(src mesh.PeerName, buf []byte) error {
	return nil
}

func (ms *MemStore) register(send mesh.Gossip) {
	ms.send = send
}

type MemMsg []byte

func (mm MemMsg) Encode() [][]byte {
	return [][]byte{mm}
}

func (mm MemMsg) Merge(new mesh.GossipData) (complete mesh.GossipData) {
	return
}
