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

// import (
// 	"testing"
// 	"time"

// 	"github.com/apple/foundationdb/bindings/go/src/fdb"
// 	"github.com/apple/foundationdb/bindings/go/src/fdb/tuple"
// 	"github.com/cosmos-gg/meq/proto"
// 	"github.com/stretchr/testify/assert"
// )

// var testNamespace = "test"

// func TestFdbPutAndGet(t *testing.T) {
// 	// init broker
// 	b := NewBroker("../broker.yaml")
// 	b.conf.Store.Engine = "fdb"
// 	b.conf.Store.FDB.Namespace = testNamespace
// 	b.Start()
// 	defer b.Shutdown()

// 	time.Sleep(2 * time.Second)
// 	// put into fdb
// 	b.store.Store(mockExactMsgs)
// 	time.Sleep(2 * time.Second)
// 	// get from fdb
// 	msgs := b.store.Query(mockExactMsgs[0].Topic, 20, mockExactMsgs[0].ID, false)
// 	assert.Equal(t, mockExactMsgs[1:], msgs)

// 	f := b.store.(*FdbStore)
// 	f.dbs[0].db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
// 		tr.ClearRange(f.dbs[0].msgsp)
// 		tr.ClearRange(f.dbs[0].normalCountSP)
// 		return
// 	})

// }

// func TestFdbPutAndGetFromNewest(t *testing.T) {
// 	// init broker
// 	b := NewBroker("../broker.yaml")
// 	b.conf.Store.Engine = "fdb"
// 	b.conf.Store.FDB.Namespace = testNamespace
// 	b.Start()
// 	defer b.Shutdown()

// 	time.Sleep(2 * time.Second)
// 	// put into fdb
// 	b.store.Store(mockExactMsgs)

// 	time.Sleep(2 * time.Second)
// 	// get from fdb
// 	msgs := b.store.Query(mockExactMsgs[0].Topic, 20, proto.MSG_NEWEST_OFFSET, false)

// 	assert.Equal(t, mockExactMsgs, msgs)

// 	f := b.store.(*FdbStore)
// 	f.dbs[0].db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
// 		tr.ClearRange(f.dbs[0].msgsp)
// 		tr.ClearRange(f.dbs[0].normalCountSP)
// 		return
// 	})

// }

// func TestFdbCount(t *testing.T) {
// 	// init broker
// 	b := NewBroker("../broker.yaml")
// 	b.conf.Store.Engine = "fdb"
// 	b.conf.Store.FDB.Namespace = testNamespace
// 	b.Start()
// 	defer b.Shutdown()

// 	topic := []byte("test")

// 	time.Sleep(2 * time.Second)
// 	f := b.store.(*FdbStore)
// 	d := f.dbs[0]
// 	ck := d.normalCountSP.Pack(tuple.Tuple{topic})
// 	incrCount(d.db, ck, 10)
// 	decrCount(d.db, ck, 3)

// 	n, _ := getCount(d.db, ck)
// 	assert.Equal(t, int64(7), n)

// 	decrCount(d.db, ck, 10)
// 	n, _ = getCount(d.db, ck)
// 	assert.Equal(t, int64(0), n)

// 	incrCount(d.db, ck, 10)
// 	decrCount(d.db, ck, proto.REDUCE_ALL_COUNT)
// 	n, _ = getCount(d.db, ck)
// 	assert.Equal(t, int64(0), n)

// 	d.db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
// 		tr.ClearRange(d.msgsp)
// 		tr.ClearRange(d.normalCountSP)
// 		return
// 	})
// }
