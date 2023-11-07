package storage

import (
	"errors"

	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
)

/* update table structure to current xobserve version */
func update() error {
	var userData []byte
	err := db.Conn.QueryRow("SELECT data FROM user limit 1").Scan(&userData)
	if err != nil && e.IsErrNoColumn(err) {
		_, err = db.Conn.Exec("ALTER TABLE user ADD COLUMN data MEDIUMTEXT")
		if err != nil {
			return errors.New("update storage error:" + err.Error())
		}
	}

	return nil
}
