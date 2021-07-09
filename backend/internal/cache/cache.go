package cache

import (
	"time"

	"github.com/datav-io/datav/backend/pkg/db"
	"github.com/datav-io/datav/backend/pkg/log"
	"github.com/datav-io/datav/backend/pkg/models"
	"github.com/datav-io/datav/backend/pkg/utils/simplejson"
)

var logger = log.RootLogger.New("logger", "cache")

var Dashboards = make(map[int64]*models.Dashboard)
var Folders = make(map[int]*models.Folder)
var Alerts []*models.Alert

// InitCache load dashboard data from sql store periodically
func InitCache() {
	go func() {
		for {
			dashboards := make(map[int64]*models.Dashboard)
			rows, err := db.SQL.Query(`SELECT id,title,uid,folder_id,data,owned_by FROM dashboard`)
			if err != nil {
				logger.Warn("load dashboard into search cache,query error", "error", err)
				time.Sleep(5 * time.Second)
				continue
			}

			var id, ownedBy int64
			var folderId int
			var title, uid string
			var rawJSON []byte
			for rows.Next() {
				err := rows.Scan(&id, &title, &uid, &folderId, &rawJSON, &ownedBy)
				if err != nil {
					logger.Warn("load dashboard into search cache,scan error", "error", err)
					continue
				}

				data := simplejson.New()
				err = data.UnmarshalJSON(rawJSON)

				dash := &models.Dashboard{
					Id:       id,
					Uid:      uid,
					Title:    title,
					FolderId: folderId,
					Data:     data,
					OwnedBy:  ownedBy,
				}
				dash.UpdateSlug()
				dashboards[id] = dash
			}
			Dashboards = dashboards

			folders := make(map[int]*models.Folder)
			rows, err = db.SQL.Query(`SELECT id,title,uid,owned_by,parent_id FROM folder`)
			if err != nil {
				logger.Warn("load dashboard into search cache,query error", "error", err)
				time.Sleep(5 * time.Second)
				continue
			}

			var fid int
			for rows.Next() {
				err := rows.Scan(&fid, &title, &uid, &ownedBy, &folderId)
				if err != nil {
					logger.Warn("load dashboard into search cache,scan error", "error", err)
					continue
				}

				folders[fid] = &models.Folder{
					Id:       fid,
					Uid:      uid,
					Title:    title,
					OwnedBy:  ownedBy,
					ParentId: folderId,
				}
			}
			generalFolder := &models.Folder{
				Id:       0,
				ParentId: -1,
				Uid:      "general",
				Title:    "General",
			}
			generalFolder.UpdatSlug()
			generalFolder.UpdateUrl()

			folders[0] = generalFolder
			Folders = folders

			alerts, err := models.GetAllAlerts()
			if err != nil {
				logger.Warn("load all alerts into  cache error", "error", err)
				time.Sleep(5 * time.Second)
				continue
			}
			Alerts = alerts

			time.Sleep(5 * time.Second)
		}
	}()
}
