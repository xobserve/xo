package service

import (
	"bytes"
	"sync"
	"time"
)

type MemStore struct {
	In        chan *Message
	DB        map[string]map[string]*Message
	DBIndex   map[string][]string
	DBIDIndex map[string]string
	bk        *Broker
	cache     []*Message
	topicConn map[string][]uint64
	ackCache  [][]byte
	sync.Mutex
}

const (
	MaxCacheLength    = 10000
	MaxMemFlushLength = 100
)

func (ms *MemStore) Init() {
	ms.In = make(chan *Message, MaxCacheLength)
	ms.DB = make(map[string]map[string]*Message)
	ms.DBIndex = make(map[string][]string)
	ms.DBIDIndex = make(map[string]string)
	ms.cache = make([]*Message, 0)

	go func() {
		for ms.bk.running || len(ms.In) != 0 {
			msg := <-ms.In
			ms.Lock()
			ms.cache = append(ms.cache, msg)
			ms.Unlock()
			if len(ms.cache) >= MaxMemFlushLength {
				ms.Flush()
			}
		}
	}()

	go func() {
		for ms.bk.running || len(ms.cache) != 0 {
			time.Sleep(1 * time.Second)
			ms.Flush()
		}
	}()

	go func() {
		for ms.bk.running || len(ms.ackCache) != 0 {
			time.Sleep(1 * time.Second)
			ms.FlushAck()
		}
	}()
}

func (ms *MemStore) Put(msg *Message) {
	ms.In <- msg
}

func (ms *MemStore) Flush() {
	if len(ms.cache) == 0 {
		return
	}
	ms.Lock()
	defer ms.Unlock()
	for _, msg := range ms.cache {
		t := string(msg.Topic)
		_, ok := ms.DB[t]
		if !ok {
			ms.DB[t] = make(map[string]*Message)
		}

		ms.DB[t][string(msg.ID)] = msg
		ms.DBIndex[t] = append(ms.DBIndex[t], string(msg.ID))
		ms.DBIDIndex[string(msg.ID)] = t
	}
	ms.cache = ms.cache[:0]
}

func (ms *MemStore) Get(t []byte, count int, offset []byte) []*Message {
	topic := string(t)

	ms.Lock()
	defer ms.Unlock()
	msgs := ms.DB[topic]
	index := ms.DBIndex[topic]

	newMsgs := make([]*Message, 0)
	if count == -1 { // get all messages
		for _, id := range index {
			msg := msgs[id]
			newMsgs = append(newMsgs, msg)
		}

		return newMsgs
	}

	// offset == []byte("0"), pull from the newest message

	if bytes.Compare(offset, MSG_NEWEST_OFFSET) == 0 {
		if count > len(index) {
			count = len(index)
		}
		for _, id := range index[:count] {
			msg := msgs[id]
			newMsgs = append(newMsgs, msg)
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

		if count > len(index)-pos-1 {
			count = len(index) - pos - 1
		}

		for _, id := range index[pos+1 : pos+count+1] {
			msg := msgs[id]
			newMsgs = append(newMsgs, msg)
		}
	}

	return newMsgs
}

func (ms *MemStore) GetCount(topic []byte) int {
	t := string(topic)
	ms.Lock()
	defer ms.Unlock()

	var count int
	for _, m := range ms.DB[t] {
		if !m.Acked {
			count++
		}
	}
	return count
}

func (ms *MemStore) ACK(msgid []byte) {
	ms.Lock()
	ms.ackCache = append(ms.ackCache, msgid)
	ms.Unlock()
}

func (ms *MemStore) FlushAck() {
	ms.Lock()
	defer ms.Unlock()

	var newCache [][]byte
	for _, msgid := range ms.ackCache {
		// lookup topic
		t, ok := ms.DBIDIndex[string(msgid)]
		if !ok {
			newCache = append(newCache, msgid)
			continue
		}
		if bytes.Compare([]byte(t)[:2], MQ_PREFIX) == 0 {
			delete(ms.DB[t], string(msgid))
			ids := ms.DBIndex[t]
			for i, id := range ids {
				if id == string(msgid) {
					if i == len(ids)-1 {
						ms.DBIndex[t] = nil
					} else {
						ms.DBIndex[t] = append(ids[:i], ids[i+1:]...)
					}
				}
			}
		} else {
			// set message status to acked
			msg := ms.DB[t][string(msgid)]
			msg.Acked = true
		}
	}

	ms.ackCache = newCache
}
func (ms *MemStore) Sub(topic []byte, cid uint64) {
	t := string(topic)
	ms.Lock()
	ms.topicConn[t] = append(ms.topicConn[t], cid)
	ms.Unlock()
}

func (ms *MemStore) Unsub(topic []byte, cid uint64) {
	t := string(topic)
	ms.Lock()
	cids := ms.topicConn[t]
	for i, id := range cids {
		if id == cid {
			ms.topicConn[t] = append(cids[:i], cids[i+1:]...)
		}
	}
	ms.Unlock()
}

func (ms *MemStore) FindConnByTopic(topic []byte) []uint64 {
	ms.Lock()
	cids := ms.topicConn[string(topic)]
	ms.Unlock()
	return cids
}
