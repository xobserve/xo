package service

import (
	"bytes"
	"encoding/binary"
	"log"
	"math/rand"
	"sync"
	"time"

	"github.com/meqio/meq/broker/service/network"
	"github.com/meqio/meq/proto"
)

type MemStore struct {
	In        chan *proto.Message
	DB        map[string]map[string]*proto.Message
	DBIndex   map[string][]string
	DBIDIndex map[string]string

	timerDB []*proto.TimerMsg

	bk    *Broker
	cache []*proto.Message

	ackCache [][]byte

	send chan []byte
	recv chan []byte

	topics map[string][]*Group
	sync.Mutex
}

const (
	MaxCacheLength    = 10000
	MaxMemFlushLength = 100
)

const (
	MEM_MSG_ADD   = 'a'
	MEM_MSG_ACK   = 'b'
	MEM_MSG_NODE  = 'c'
	MEM_MSG_SUB   = 'd'
	MEM_MSG_UNSUB = 'e'
)

func (ms *MemStore) Init() {
	ms.In = make(chan *proto.Message, MaxCacheLength)
	ms.DB = make(map[string]map[string]*proto.Message)
	ms.DBIndex = make(map[string][]string)
	ms.DBIDIndex = make(map[string]string)
	ms.cache = make([]*proto.Message, 0)
	ms.topics = make(map[string][]*Group)

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

	// data transfar and synchronization
	go func() {
		ms.recv = make(chan []byte, 1000)
		ms.send = make(chan []byte, 1000)

		go func() {
			err := network.StartNode(Conf.Store.Addr, Conf.Store.Seed, ms.send, ms.recv)
			if err != nil {
				log.Panic("启动P2P节点失败: " + err.Error())
			}
		}()

		for {
			r := <-ms.recv
			switch r[0] {
			case MEM_MSG_ADD:
				msg := unpackMsgAdd(r[1:])
				ms.In <- &msg
			case MEM_MSG_ACK:
				ms.Lock()
				ms.ackCache = append(ms.ackCache, r[1:])
				ms.Unlock()
			case MEM_MSG_NODE:
				ms.Lock()
				ms.bk.router.cluster[string(r[1:])] = struct{}{}
				ms.Unlock()
			case MEM_MSG_SUB:
				tl, _ := binary.Uvarint(r[1:3])
				topic := r[3 : 3+tl]
				// group
				gl, _ := binary.Uvarint(r[3+tl : 4+tl])
				group := r[4+tl : 4+tl+gl]
				// cid
				cid, _ := binary.Uvarint(r[4+tl+gl : 8+tl+gl])
				// addr
				addr := r[8+tl+gl:]
				ms.sub(topic, group, cid, string(addr))

			case MEM_MSG_UNSUB:
				tl, _ := binary.Uvarint(r[1:3])
				topic := r[3 : 3+tl]
				// group
				gl, _ := binary.Uvarint(r[3+tl : 4+tl])
				group := r[4+tl : 4+tl+gl]
				// cid
				cid, _ := binary.Uvarint(r[4+tl+gl : 8+tl+gl])
				// addr
				addr := r[8+tl+gl:]
				ms.unsub(topic, group, cid, string(addr))

			}
		}
	}()

	// register self to the cluster
	go func() {
		for {
			ar := []byte(Conf.Router.Addr)
			msg := make([]byte, 1+len(ar))
			msg[0] = MEM_MSG_NODE
			copy(msg[1:], ar)

			select {
			case ms.send <- msg:
			default:
			}

			time.Sleep(5 * time.Second)
		}
	}()
}

func (ms *MemStore) Put(msgs []*proto.Message) {
	for _, msg := range msgs {
		ms.In <- msg
		m := packMsgAdd(*msg)
		select {
		case ms.send <- m:
		default:
		}
	}

}

func (ms *MemStore) Flush() {
	if len(ms.cache) == 0 {
		return
	}
	ms.Lock()
	defer ms.Unlock()
	for _, msg := range ms.cache {
		if _, ok := ms.DBIDIndex[string(msg.ID)]; ok {
			continue
		}

		t := string(msg.Topic)
		_, ok := ms.DB[t]
		if !ok {
			ms.DB[t] = make(map[string]*proto.Message)
		}

		ms.DB[t][string(msg.ID)] = msg
		ms.DBIndex[t] = append(ms.DBIndex[t], string(msg.ID))
		ms.DBIDIndex[string(msg.ID)] = t
	}
	ms.cache = ms.cache[:0]
}

func (ms *MemStore) Get(t []byte, count int, offset []byte) []*proto.Message {
	topic := string(t)

	ms.Lock()
	defer ms.Unlock()
	msgs := ms.DB[topic]
	index := ms.DBIndex[topic]

	newMsgs := make([]*proto.Message, 0)
	if count == 0 { // get all messages
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

	// sync ack to other nodes
	newb := make([]byte, len(msgid)+1)
	newb[0] = MEM_MSG_ACK
	copy(newb[1:], msgid)

	select {
	case ms.send <- newb:
	default:
	}
}

func (ms *MemStore) FlushAck() {
	ms.Lock()
	defer ms.Unlock()

	if len(ms.ackCache) == 0 {
		return
	}

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
			delete(ms.DBIDIndex, string(msgid))
		} else {
			// set message status to acked
			msg := ms.DB[t][string(msgid)]
			msg.Acked = true
		}
	}

	ms.ackCache = newCache
}
func (ms *MemStore) Sub(topic []byte, group []byte, cid uint64) {
	ms.sub(topic, group, cid, Conf.Router.Addr)

	// sync to other nodes
	tl := uint64(len(topic))
	gl := uint64(len(group))
	addr := []byte(Conf.Router.Addr)

	msg := make([]byte, 1+2+tl+1+gl+4+uint64(len(addr)))
	// control
	msg[0] = MEM_MSG_SUB
	// topic
	binary.PutUvarint(msg[1:3], tl)
	copy(msg[3:3+tl], topic)
	// group
	binary.PutUvarint(msg[3+tl:4+tl], gl)
	copy(msg[4+tl:4+tl+gl], group)
	// cid
	binary.PutUvarint(msg[4+tl+gl:8+tl+gl], cid)
	// addr
	copy(msg[8+tl+gl:], addr)

	ms.send <- msg
}

func (ms *MemStore) sub(topic []byte, group []byte, cid uint64, addr string) {
	t := string(topic)
	ms.Lock()
	ms.Unlock()
	t1, ok := ms.topics[t]
	if !ok {
		// []group
		g := &Group{
			ID: group,
			sess: []Sess{
				Sess{
					Addr: addr,
					Cid:  cid,
				},
			},
		}
		ms.topics[t] = []*Group{g}
	} else {
		for _, g := range t1 {
			// group already exist,add to group
			if bytes.Compare(g.ID, group) == 0 {
				g.sess = append(g.sess, Sess{
					Addr: addr,
					Cid:  cid,
				})
				return
			}
		}
		// create group
		g := &Group{
			ID: group,
			sess: []Sess{
				Sess{
					Addr: addr,
					Cid:  cid,
				},
			},
		}
		ms.topics[t] = append(ms.topics[t], g)
	}
}

func (ms *MemStore) Unsub(topic []byte, group []byte, cid uint64) {
	ms.unsub(topic, group, cid, Conf.Router.Addr)

	// sync to other nodes
	tl := uint64(len(topic))
	gl := uint64(len(group))
	addr := []byte(Conf.Router.Addr)
	msg := make([]byte, 1+2+tl+1+gl+4+uint64(len(addr)))
	// control
	msg[0] = MEM_MSG_UNSUB
	// topic
	binary.PutUvarint(msg[1:3], tl)
	copy(msg[3:3+tl], topic)
	// group
	binary.PutUvarint(msg[3+tl:4+tl], gl)
	copy(msg[4+tl:4+tl+gl], group)
	// cid
	binary.PutUvarint(msg[4+tl+gl:8+tl+gl], cid)
	// addr
	copy(msg[8+tl+gl:], addr)
	ms.send <- msg
}

func (ms *MemStore) unsub(topic []byte, group []byte, cid uint64, addr string) {
	t := string(topic)
	ms.Lock()
	defer ms.Unlock()
	t1, ok := ms.topics[t]
	if !ok {
		return
	}
	for j, g := range t1 {
		if bytes.Compare(g.ID, group) == 0 {
			// group exist
			for i, c := range g.sess {
				if c.Cid == cid && addr == c.Addr {
					// delete sess
					g.sess = append(g.sess[:i], g.sess[i+1:]...)
					if len(g.sess) == 0 {
						//delete group
						ms.topics[t] = append(ms.topics[t][:j], ms.topics[t][j+1:]...)
					}
					return
				}
			}
		}
	}
}

func (ms *MemStore) FindRoutes(topic []byte) ([]uint64, []Sess) {
	t := string(topic)
	groups, ok := ms.topics[t]
	if !ok || len(groups) == 0 {
		return nil, nil
	}

	var outer []Sess
	var local []uint64

	for _, g := range groups {
		s := g.sess[rand.Intn(len(g.sess))]
		if s.Addr == Conf.Router.Addr {
			local = append(local, s.Cid)
		} else {
			outer = append(outer, s)
		}
	}

	return local, outer
}

func (ms *MemStore) PutTimerMsg(m *proto.TimerMsg) {
	ms.Lock()
	ms.timerDB = append(ms.timerDB, m)
	ms.Unlock()
}

func (ms *MemStore) ScanTimerMsg() {

}

func packMsgAdd(m proto.Message) []byte {
	msgid := m.ID
	payload := m.Payload

	msg := make([]byte, 1+2+len(msgid)+4+len(payload)+1+2+len(m.Topic)+1)
	msg[0] = MEM_MSG_ADD
	// msgid
	binary.PutUvarint(msg[1:3], uint64(len(msgid)))
	copy(msg[3:3+len(msgid)], msgid)

	// payload
	binary.PutUvarint(msg[3+len(msgid):7+len(msgid)], uint64(len(payload)))
	copy(msg[7+len(msgid):7+len(msgid)+len(payload)], payload)

	// acked
	if m.Acked {
		msg[7+len(msgid)+len(payload)] = '1'
	} else {
		msg[7+len(msgid)+len(payload)] = '0'
	}

	// topic
	binary.PutUvarint(msg[7+len(msgid)+len(payload)+1:7+len(msgid)+len(payload)+3], uint64(len(m.Topic)))
	copy(msg[7+len(msgid)+len(payload)+3:7+len(msgid)+len(payload)+3+len(m.Topic)], m.Topic)

	// type
	binary.PutUvarint(msg[7+len(msgid)+len(payload)+3+len(m.Topic):7+len(msgid)+len(payload)+3+len(m.Topic)+1], uint64(m.Type))
	return msg
}

func unpackMsgAdd(b []byte) proto.Message {
	ml, _ := binary.Uvarint(b[:2])
	msgid := b[2 : 2+ml]

	// payload
	pl, _ := binary.Uvarint(b[2+ml : 6+ml])
	payload := b[6+ml : 6+ml+pl]

	//acked
	var acked bool
	if b[6+ml+pl] == '1' {
		acked = true
	}

	// topic
	tl, _ := binary.Uvarint(b[6+ml+pl+1 : 6+ml+pl+3])
	topic := b[6+ml+pl+3 : 6+ml+pl+3+tl]

	// type
	tp, _ := binary.Uvarint(b[6+ml+pl+3+tl : 7+ml+pl+3+tl])
	return proto.Message{msgid, topic, payload, acked, int8(tp)}
}
