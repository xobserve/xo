package server

import (
	"time"

	"github.com/opendatav/datav/backend/pkg/db"
)

func startTimer() {
	// delete historical alerts rules
	go func() {
		for {
			rows, err := db.SQL.Query(`SELECT id,dashboard_id,panel_id from alert`)
			if err != nil {
				logger.Error("select alerts in timer error", "error", err)
			} else {
				for rows.Next() {
					var id, dashId, panelId int64
					err = rows.Scan(&id, &dashId, &panelId)
					if err != nil {
						continue
					}

					// dash := cache.
				}
			}
			time.Sleep(1 * time.Hour)
		}
	}()
}
