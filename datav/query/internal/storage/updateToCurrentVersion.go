package storage

/* update table structure to current xobserve version */
func update() error {
	// var isPublic bool
	// err := db.Conn.QueryRow("SELECT is_public FROM tenant limit 1").Scan(&isPublic)
	// if err != nil && e.IsErrNoColumn(err) {
	// 	_, err = db.Conn.Exec("ALTER TABLE tenant ADD COLUMN is_public BOOL DEFAULT FALSE")
	// 	if err != nil {
	// 		return errors.New("update storage error:" + err.Error())
	// 	}
	// }

	return nil
}
