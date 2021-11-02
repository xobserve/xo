package server

import (
	"time"

	"github.com/savecost/datav/backend/pkg/db"

	"github.com/savecost/datav/backend/internal/cache"
	"github.com/savecost/datav/backend/pkg/utils/simplejson"
)

func startTimer() {
	// delete historical alerts rules
	go func() {
		for {
			time.Sleep(10 * time.Second)
			for _, alert := range cache.Alerts {
				dash, ok := cache.Dashboards[alert.DashboardId]
				if !ok {
					logger.Warn("can't find dashboard for alert", "alert_name", alert.Name)
					continue
				}

				exist := false
				for _, panelObj := range dash.Data.Get("panels").MustArray() {
					panel := simplejson.NewFromAny(panelObj)

					panelID, err := panel.Get("id").Int64()
					if err != nil {
						logger.Warn("extract panel id error", "error", err)
						continue
					}

					if panelID == alert.PanelId {
						exist = true
					}
				}

				if !exist {
					_, err := db.SQL.Exec(`DELETE FROM alert WHERE id = ?`, alert.Id)
					if err != nil {
						logger.Warn("detele alert error", "error", err)
					}
				}
			}
			time.Sleep(1 * time.Hour)
		}
	}()
}
