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
	"encoding/binary"
	"sync"
	"time"

	"github.com/apple/foundationdb/bindings/go/src/fdb"
	"github.com/apple/foundationdb/bindings/go/src/fdb/directory"
	"github.com/apple/foundationdb/bindings/go/src/fdb/subspace"
	"github.com/apple/foundationdb/bindings/go/src/fdb/tuple"
	"github.com/cosmos-gg/meq/proto"
	"go.uber.org/zap"
)

type FdbStore struct {
	bk      *Broker
	dbs     []*database
	pubchs  [](chan []*proto.PubMsg)
	readchs [](chan []proto.Ack)
	delchs  [](chan *proto.PubMsg)

	countch chan countMsg
	sync.RWMutex
}

type countMsg struct {
	topic []byte
	user  []byte
	count int
}

type database struct {
	db            fdb.Database
	msgsp         subspace.Subspace
	normalCountSP subspace.Subspace
	chatroomSP    subspace.Subspace
}

const (
	FdbCacheInitLen = 1000
)

/*------------------------------Storage interface implemented------------------------*/

func (f *FdbStore) Init() {
	fdb.MustAPIVersion(510)

	f.dbs = make([]*database, f.bk.conf.Store.FDB.Threads)
	f.pubchs = make([](chan []*proto.PubMsg), f.bk.conf.Store.FDB.Threads)
	f.readchs = make([](chan []proto.Ack), f.bk.conf.Store.FDB.Threads)
	f.delchs = make([](chan *proto.PubMsg), f.bk.conf.Store.FDB.Threads)
	f.countch = make(chan countMsg, FdbCacheInitLen)
	for i := 0; i < f.bk.conf.Store.FDB.Threads; i++ {
		go f.process(i)
	}

	normalTopicCount := make(map[string]int)
	chatTopicCount := make(map[string]int)
	go func() {
		c1 := time.NewTicker(2 * time.Second).C
		for f.bk.running {
			select {
			case c := <-f.countch:
				if proto.GetTopicType(c.topic) == proto.TopicTypeNormal {
					normalTopicCount[string(c.topic)] += c.count
				} else {
					chatTopicCount[string(c.topic)] += c.count
				}
			case <-c1:
				if len(normalTopicCount) > 0 {
					d := f.dbs[0]
					_, err := d.db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
						for t, c := range normalTopicCount {
							ck := d.normalCountSP.Pack(tuple.Tuple{[]byte(t)})
							incrCount(d.db, ck, c)
						}
						return
					})
					if err != nil {
						L.Info("put normal count error", zap.Error(err))
						continue
					}
					normalTopicCount = make(map[string]int)
				}
			}
		}
	}()

	go func() {
		c1 := time.NewTicker(3 * time.Second).C
		for f.bk.running {
			select {
			case <-c1:
				if len(chatTopicCount) > 0 {
					d := f.dbs[0]
					_, err := d.db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
						for topic, count := range chatTopicCount {
							t := []byte(topic)
							pr, _ := fdb.PrefixRange(d.chatroomSP.Pack(tuple.Tuple{t}))
							ir := tr.GetRange(pr, fdb.RangeOptions{}).Iterator()

							for ir.Advance() {
								v := ir.MustGet()
								key := v.Key
								val := v.Value

								ocount := binary.LittleEndian.Uint32(val)
								ncount := ocount + uint32(count)

								b := make([]byte, 4)
								binary.LittleEndian.PutUint32(b, ncount)

								tr.Set(key, b)
							}
						}
						return
					})
					if err != nil {
						L.Info("put chat count error", zap.Error(err))
						continue
					}
					chatTopicCount = make(map[string]int)
				}
			}
		}
	}()
}

func (f *FdbStore) Close() {

}

var putcounts uint64 = 0

// deliver to the fdb processor with robin strategy
func (f *FdbStore) Store(msgs []*proto.PubMsg) {
	// for lock free solution
	i := putcounts % uint64(f.bk.conf.Store.FDB.Threads)
	f.pubchs[i] <- msgs

	putcounts++
}

var ackcounts uint64 = 0

func (f *FdbStore) MarkRead(topic []byte, msgids [][]byte) {
	reads := make([]proto.Ack, len(msgids))
	for i, id := range msgids {
		reads[i] = proto.Ack{topic, id}
	}

	// for lock free solution
	i := putcounts % uint64(f.bk.conf.Store.FDB.Threads)
	f.readchs[i] <- reads

	putcounts++
}

var (
	fdbStoreBegin = []byte("0")
	fdbStoreEnd   = []byte("ff")
)

var getcounts uint64 = 0

func (f *FdbStore) Query(t []byte, count int, offset []byte, acked bool) []*proto.PubMsg {
	i := getcounts % uint64(f.bk.conf.Store.FDB.Threads)
	getcounts++

	d := f.dbs[i]
	var msgs []*proto.PubMsg
	now := time.Now().Unix()

	_, err := d.db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
		pr, _ := fdb.PrefixRange(t)
		pr.Begin = d.msgsp.Pack(tuple.Tuple{t, fdbStoreBegin})
		if bytes.Compare(offset, proto.MSG_NEWEST_OFFSET) == 0 {
			pr.End = d.msgsp.Pack(tuple.Tuple{t, fdbStoreEnd})
		} else {
			pr.End = d.msgsp.Pack(tuple.Tuple{t, offset})
		}

		//@performance
		//get one by one in advance
		ir := tr.GetRange(pr, fdb.RangeOptions{Limit: count, Reverse: true}).Iterator()
		for ir.Advance() {
			b := ir.MustGet().Value
			m, _ := proto.UnpackMsg(b[1:])
			if m.TTL == proto.NeverExpires || m.TTL > now {
				msgs = append(msgs, m)
				continue
			}
			f.delchs[i] <- m
		}
		return
	})

	if err != nil {
		L.Info("get messsage error", zap.Error(err))
	}

	return msgs
}

func (f *FdbStore) UnreadCount(topic []byte, user []byte) int {
	i := getcounts % uint64(f.bk.conf.Store.FDB.Threads)
	getcounts++

	d := f.dbs[i]

	var count int
	tp := proto.GetTopicType(topic)
	if tp == proto.TopicTypeNormal {
		ck := d.normalCountSP.Pack(tuple.Tuple{topic})
		c, _ := getCount(d.db, ck)
		count = int(c)
	} else {
		k := d.chatroomSP.Pack(tuple.Tuple{topic, user})
		v, err := getK(d.db, k)
		if err != nil {
			L.Info("unread count error", zap.Error(err), zap.ByteString("topic", topic), zap.ByteString("user", user))
			count = 0
		} else {
			if len(v) == 4 {
				c := binary.LittleEndian.Uint32(v)
				count = int(c)
			} else {
				count = 0
			}
		}
	}

	return count
}

func (f *FdbStore) UpdateUnreadCount(topic []byte, user []byte, isAdd bool, count int) {
	tp := proto.GetTopicType(topic)
	if tp == proto.TopicTypeNormal {
		if !isAdd {
			i := getcounts % uint64(f.bk.conf.Store.FDB.Threads)
			getcounts++

			d := f.dbs[i]
			ck := d.normalCountSP.Pack(tuple.Tuple{topic})

			decrCount(d.db, ck, count)
		} else {
			f.countch <- countMsg{topic, nil, count}
		}
	} else {
		if !isAdd {
			i := getcounts % uint64(f.bk.conf.Store.FDB.Threads)
			getcounts++

			d := f.dbs[i]
			k := d.chatroomSP.Pack(tuple.Tuple{topic, user})

			// for chat topic, read means set unread to 0
			b := make([]byte, 4)
			setKV(d.db, k, b)
		} else {
			f.countch <- countMsg{topic, nil, count}
		}
	}
}

func (f *FdbStore) StoreTM(*proto.TimerMsg) {

}

func (f *FdbStore) QueryTM() []*proto.PubMsg {
	return nil
}

func (f *FdbStore) JoinChat(topic []byte, user []byte) error {
	i := getcounts % uint64(f.bk.conf.Store.FDB.Threads)
	getcounts++

	d := f.dbs[i]
	ck := d.chatroomSP.Pack(tuple.Tuple{topic, user})
	exist := keyExist(d.db, ck)
	if !exist {
		b := make([]byte, 4)
		binary.LittleEndian.PutUint32(b, 0)
		setKV(d.db, ck, b)
	}

	return nil
}

func (f *FdbStore) LeaveChat(topic []byte, user []byte) error {
	i := getcounts % uint64(f.bk.conf.Store.FDB.Threads)
	getcounts++

	d := f.dbs[i]
	ck := d.chatroomSP.Pack(tuple.Tuple{topic, user})

	exist := keyExist(d.db, ck)
	if exist {
		delKey(d.db, ck)
	}
	return nil
}

func (f *FdbStore) GetChatUsers(t []byte) [][]byte {
	i := getcounts % uint64(f.bk.conf.Store.FDB.Threads)
	getcounts++

	var users [][]byte
	d := f.dbs[i]
	_, err := d.db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {

		pr, _ := fdb.PrefixRange(d.chatroomSP.Pack(tuple.Tuple{t}))
		ir := tr.GetRange(pr, fdb.RangeOptions{}).Iterator()

		for ir.Advance() {
			v := ir.MustGet()
			user := v.Key
			tp, _ := d.chatroomSP.Unpack(user)
			users = append(users, tp[1].([]byte))
		}
		return
	})
	if err != nil {
		L.Info("put chat count error", zap.Error(err))
	}
	return users
}

func (f *FdbStore) Del(topic []byte, msgid []byte) error {
	i := getcounts % uint64(f.bk.conf.Store.FDB.Threads)
	getcounts++

	d := f.dbs[i]
	key := d.msgsp.Pack(tuple.Tuple{topic, msgid})
	return delKey(d.db, key)
}

// Admin part
func (f *FdbStore) SaveAdminInfo(tp int, data interface{}) {

}

func (f *FdbStore) QueryAdminInfo(tp int) interface{} {
	return nil
}

/*------------------------------Storage interface implemented------------------------*/

func put(d *database, msgs []*proto.PubMsg) {
	_, err := d.db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
		for _, msg := range msgs {
			if msg.QoS != proto.QOS0 {
				key := d.msgsp.Pack(tuple.Tuple{msg.Topic, msg.ID})
				tr.Set(key, proto.PackMsg(msg))
			}
		}
		return
	})
	if err != nil {
		L.Info("put messsage error", zap.Error(err))
	}
}

func (f *FdbStore) process(i int) {
	fdb.MustAPIVersion(510)
	db := fdb.MustOpenDefault()
	dir, err := directory.CreateOrOpen(db, []string{f.bk.conf.Store.FDB.Namespace}, nil)
	if err != nil {
		L.Fatal("init fdb(foundationDB) error", zap.Error(err))
	}
	msgsp := dir.Sub("messages")
	normalCountSP := dir.Sub("msg-count")
	chatroomSP := dir.Sub("chat-room")
	f.dbs[i] = &database{db, msgsp, normalCountSP, chatroomSP}

	pubch := make(chan []*proto.PubMsg, FdbCacheInitLen)
	readch := make(chan []proto.Ack, FdbCacheInitLen)
	delch := make(chan *proto.PubMsg, FdbCacheInitLen)

	f.pubchs[i] = pubch
	f.readchs[i] = readch
	f.delchs[i] = delch

	msgcache := make([]*proto.PubMsg, 0, FdbCacheInitLen)
	ackcache := make([]proto.Ack, 0, FdbCacheInitLen)
	delcache := make([]*proto.PubMsg, 0, FdbCacheInitLen)

	c1 := time.NewTicker(1 * time.Second).C
	c2 := time.NewTicker(3 * time.Second).C
	for f.bk.running || len(pubch) > 0 {
		select {
		case msgs := <-pubch:
			msgcache = append(msgcache, msgs...)
			if len(msgcache) >= proto.CacheFlushLen {
				put(f.dbs[i], msgcache)
				msgcache = msgcache[:0]
			}
		case acks := <-readch:
			ackcache = append(ackcache, acks...)
			if len(ackcache) >= proto.CacheFlushLen {
				ack(f.dbs[i], ackcache)
				ackcache = ackcache[:0]
			}
		case d := <-delch:
			delcache = append(delcache, d)
			if len(delcache) >= proto.CacheFlushLen {
				del(f.dbs[i], delcache)
				delcache = delcache[:0]
			}
		case <-c1:
			if len(msgcache) > 0 {
				put(f.dbs[i], msgcache)
				msgcache = msgcache[:0]
			}

			if len(ackcache) > 0 {
				ack(f.dbs[i], ackcache)
				ackcache = ackcache[:0]
			}
		case <-c2:
			if len(delcache) > 0 {
				del(f.dbs[i], delcache)
				delcache = delcache[:0]
			}
		}
	}
}

func ack(d *database, acks []proto.Ack) {
	_, err := d.db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
		for _, ack := range acks {
			key := d.msgsp.Pack(tuple.Tuple{ack.Topic, ack.Msgid})
			b := tr.Get(key).MustGet()
			// update msg acked to true(1)
			// msgid
			if len(b) == 0 {
				continue
			}
			ml, _ := binary.Uvarint(b[:2])

			// payload
			pl, _ := binary.Uvarint(b[2+ml : 6+ml])
			// update ack
			if b[6+ml+pl] != '1' {
				b[6+ml+pl] = '1'
				tr.Set(key, b)
			}
		}
		return
	})
	if err != nil {
		L.Info("put messsage error", zap.Error(err))
	}
}

func del(d *database, msgs []*proto.PubMsg) {
	_, err := d.db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
		for _, msg := range msgs {
			key := d.msgsp.Pack(tuple.Tuple{msg.Topic, msg.ID})
			tr.Clear(key)
		}
		return
	})
	if err != nil {
		L.Info("del messsage error", zap.Error(err))
	}
}

func incrCount(tor fdb.Transactor, k fdb.Key, n int) error {
	_, e := tor.Transact(func(tr fdb.Transaction) (interface{}, error) {
		buf := new(bytes.Buffer)
		err := binary.Write(buf, binary.LittleEndian, int64(n))
		if err != nil {
			return nil, err
		}
		one := buf.Bytes()
		tr.Add(k, one)
		return nil, nil
	})
	return e
}

func decrCount(tor fdb.Transactor, k fdb.Key, delta int) error {
	_, e := tor.Transact(func(tr fdb.Transaction) (interface{}, error) {
		if delta != proto.REDUCE_ALL_COUNT {
			on, err := getCount(tor, k)
			if err != nil {
				return nil, err
			}
			if on-int64(delta) <= 0 {
				goto SET_0
			}
			buf := new(bytes.Buffer)
			err = binary.Write(buf, binary.LittleEndian, int64(-delta))
			if err != nil {
				return nil, err
			}
			negativeOne := buf.Bytes()
			tr.Add(k, negativeOne)
			return nil, nil
		}
	SET_0:
		// ack all,set count to 0
		buf := new(bytes.Buffer)
		err := binary.Write(buf, binary.LittleEndian, int64(0))
		if err != nil {
			return nil, err
		}
		tr.Set(k, buf.Bytes())
		return nil, nil
	})

	return e
}

func getCount(tor fdb.Transactor, k fdb.Key) (int64, error) {
	val, e := tor.Transact(func(tr fdb.Transaction) (interface{}, error) {
		return tr.Get(k).Get()
	})
	if e != nil {
		return 0, e
	}
	if val == nil {
		return 0, nil
	}
	byteVal := val.([]byte)
	var numVal int64
	readE := binary.Read(bytes.NewReader(byteVal), binary.LittleEndian, &numVal)
	if readE != nil {
		return 0, readE
	} else {
		return numVal, nil
	}
}

func keyExist(tor fdb.Transactor, k fdb.Key) bool {
	val, e := tor.Transact(func(tr fdb.Transaction) (interface{}, error) {
		return tr.Get(k).Get()
	})
	if e != nil {
		return false
	}
	if val == nil {
		return false
	}

	byteVal := val.([]byte)
	if len(byteVal) == 0 {
		return false
	}

	return true
}

func delKey(tor fdb.Transactor, k fdb.Key) error {
	_, err := tor.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
		tr.Clear(k)
		return
	})
	if err != nil {
		L.Info("del key error", zap.Error(err))
	}

	return err
}

func setKV(tor fdb.Transactor, k fdb.Key, v []byte) error {
	_, err := tor.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
		tr.Set(k, v)
		return
	})
	return err
}

func getK(tor fdb.Transactor, k fdb.Key) ([]byte, error) {
	ret, err := tor.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
		return tr.Get(k).Get()
	})
	return ret.([]byte), err
}
