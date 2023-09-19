package storage

import (
	"errors"

	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/DataObserve/datav/backend/pkg/e"
)

/* update table structure to current datav version */
func update() error {
	var visibleTo string
	err := db.Conn.QueryRow("SELECT visible_to FROM dashboard limit 1").Scan(&visibleTo)
	if err != nil && e.IsErrNoColumn(err) {
		_, err = db.Conn.Exec("ALTER TABLE dashboard ADD COLUMN visible_to VARCHAR(32) DEFAULT 'team'")
		if err != nil {
			return errors.New("update storage error:" + err.Error())
		}
	}

	var isPublic bool
	err = db.Conn.QueryRow("SELECT is_public FROM team limit 1").Scan(&isPublic)
	if err != nil && e.IsErrNoColumn(err) {
		_, err = db.Conn.Exec("ALTER TABLE team ADD COLUMN is_public BOOL DEFAULT false")
		if err != nil {
			return errors.New("update storage error:" + err.Error())
		}
	}

	// default_selected VARCHAR(255),
	var defaultSelected bool
	err = db.Conn.QueryRow("SELECT default_selected FROM variable limit 1").Scan(&defaultSelected)
	if err != nil && e.IsErrNoColumn(err) {
		_, err = db.Conn.Exec("ALTER TABLE variable ADD COLUMN default_selected VARCHAR(255)")
		if err != nil {
			return errors.New("update storage error:" + err.Error())
		}
	}

	return nil
}
