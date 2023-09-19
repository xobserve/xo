package storage

import (
	"errors"

	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/DataObserve/datav/backend/pkg/e"
)

/* update table structure to current datav version */
// visible_to VARCHAR(32) DEFAULT 'team',
func update() error {
	var visibleTo string
	err := db.Conn.QueryRow("SELECT visible_to FROM dashboard limit 1").Scan(&visibleTo)
	if err != nil && e.IsErrNoColumn(err) {
		_, err = db.Conn.Exec("ALTER TABLE dashboard ADD COLUMN visible_to VARCHAR(32) DEFAULT 'team'")
		if err != nil {
			return errors.New("update storage error:" + err.Error())
		}
	}

	return nil
}
