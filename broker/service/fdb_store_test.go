package service

import (
	"testing"
	"time"

	"github.com/apple/foundationdb/bindings/go/src/fdb"
	"github.com/apple/foundationdb/bindings/go/src/fdb/tuple"
	"github.com/cosmos-gg/meq/proto"
	"github.com/stretchr/testify/assert"
)

var testNamespace = "test"

func TestFdbPutAndGet(t *testing.T) {
	// init broker
	b := NewBroker("../broker.yaml")
	b.conf.Store.Engine = "fdb"
	b.conf.Store.FDB.Namespace = testNamespace
	b.Start()
	defer b.Shutdown()

	time.Sleep(2 * time.Second)
	// put into fdb
	b.store.Put(mockExactMsgs)
	time.Sleep(2 * time.Second)
	// get from fdb
	msgs := b.store.Get(mockExactMsgs[0].Topic, 20, mockExactMsgs[0].ID, false)
	assert.Equal(t, mockExactMsgs[1:], msgs)

	f := b.store.(*FdbStore)
	f.dbs[0].db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
		tr.ClearRange(f.dbs[0].msgsp)
		tr.ClearRange(f.dbs[0].countsp)
		return
	})

}

func TestFdbPutAndGetFromNewest(t *testing.T) {
	// init broker
	b := NewBroker("../broker.yaml")
	b.conf.Store.Engine = "fdb"
	b.conf.Store.FDB.Namespace = testNamespace
	b.Start()
	defer b.Shutdown()

	time.Sleep(2 * time.Second)
	// put into fdb
	b.store.Put(mockExactMsgs)

	time.Sleep(2 * time.Second)
	// get from fdb
	msgs := b.store.Get(mockExactMsgs[0].Topic, 20, proto.MSG_NEWEST_OFFSET, false)

	assert.Equal(t, mockExactMsgs, msgs)

	f := b.store.(*FdbStore)
	f.dbs[0].db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
		tr.ClearRange(f.dbs[0].msgsp)
		tr.ClearRange(f.dbs[0].countsp)
		return
	})

}

func TestFdbCount(t *testing.T) {
	// init broker
	b := NewBroker("../broker.yaml")
	b.conf.Store.Engine = "fdb"
	b.conf.Store.FDB.Namespace = testNamespace
	b.Start()
	defer b.Shutdown()

	topic := []byte("test")

	time.Sleep(2 * time.Second)
	f := b.store.(*FdbStore)
	d := f.dbs[0]
	ck := d.countsp.Pack(tuple.Tuple{topic})
	incrCount(d.db, ck, 10)
	decrCount(d.db, ck, 3)

	n, _ := getCount(d.db, ck)
	assert.Equal(t, int64(7), n)

	decrCount(d.db, ck, 10)
	n, _ = getCount(d.db, ck)
	assert.Equal(t, int64(0), n)

	incrCount(d.db, ck, 10)
	decrCount(d.db, ck, proto.ACK_ALL_COUNT)
	n, _ = getCount(d.db, ck)
	assert.Equal(t, int64(0), n)

	d.db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
		tr.ClearRange(d.msgsp)
		tr.ClearRange(d.countsp)
		return
	})
}
