package service

import (
	"fmt"
	"net/http"

	"github.com/apple/foundationdb/bindings/go/src/fdb"
	"github.com/labstack/echo"
)

func (b *Broker) clearStore(c echo.Context) error {
	token := c.FormValue("token")
	if token != b.conf.Broker.Token {
		return c.String(http.StatusOK, "invalid admin token")
	}

	f, ok := b.store.(*FdbStore)
	if !ok {
		return c.String(http.StatusOK, "not fdb store engine,ignore")
	}

	i := getcounts % uint64(f.bk.conf.Store.FDB.Threads)
	d := f.dbs[i]

	_, err := d.db.Transact(func(tr fdb.Transaction) (ret interface{}, err error) {
		tr.ClearRange(d.msgsp)
		tr.ClearRange(d.normalCountSP)
		tr.ClearRange(d.chatCountSP)
		tr.ClearRange(d.chatroomSP)
		return
	})
	if err != nil {
		return c.String(http.StatusOK, fmt.Sprintf("error happens: %v", err))
	}

	return c.String(http.StatusOK, "clear store ok")
}
