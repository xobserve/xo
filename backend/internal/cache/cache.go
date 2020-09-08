package cache

import (
	"time"
	"github.com/codecc-com/datav/backend/pkg/db"
	"github.com/codecc-com/datav/backend/pkg/models"
	"github.com/codecc-com/datav/backend/pkg/log"
	"github.com/codecc-com/datav/backend/pkg/utils/simplejson"
)

var logger = log.RootLogger.New("logger", "cache")

var Dashboards = make(map[string]*models.Dashboard)
var Folders =  make(map[int]*models.Folder)

// InitCache load dashboard data from sql store periodically
func InitCache() {
	go func() {
		for {
			dashboards := make(map[string]*models.Dashboard)
			rows,err := db.SQL.Query(`SELECT id,title,uid,folder_id,data FROM dashboard`)
			if err != nil {
				logger.Warn("load dashboard into search cache,query error","error",err)
				time.Sleep(5 * time.Second)
				continue 
			}

			var id,ownedBy int64 
			var folderId int
			var title,uid string
			var rawJSON []byte
			for rows.Next() {
				err := rows.Scan(&id,&title,&uid,&folderId,&rawJSON)
				if err != nil {
					logger.Warn("load dashboard into search cache,scan error","error",err)
					continue
				}

				data := simplejson.New()
				err = data.UnmarshalJSON(rawJSON)

				dashboards[title] = &models.Dashboard{
					Id: id,
					Uid: uid,
					Title: title,
					FolderId: folderId,
					Data: data,
				}
			}
			Dashboards = dashboards


			folders :=  make(map[int]*models.Folder)
			rows,err = db.SQL.Query(`SELECT id,title,uid,owned_by,parent_id FROM folder`)
			if err != nil {
				logger.Warn("load dashboard into search cache,query error","error",err)
				time.Sleep(5 * time.Second)
				continue 
			}

			var fid int
			for rows.Next() {
				err := rows.Scan(&fid,&title,&uid,&ownedBy,&folderId)
				if err != nil {
					logger.Warn("load dashboard into search cache,scan error","error",err)
					continue
				}

				folders[fid] = &models.Folder{
					Id: fid,
					Uid: uid,
					Title: title,
					OwnedBy: ownedBy,
					ParentId: folderId,
				}
			}
			Folders = folders

			time.Sleep(10 * time.Second)
		}
	}()
}

