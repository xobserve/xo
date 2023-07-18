// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package dashboard

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/MyStarship/starship/backend/pkg/common"
	"github.com/MyStarship/starship/backend/pkg/db"
	"github.com/MyStarship/starship/backend/pkg/e"
	"github.com/MyStarship/starship/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

var historyCh = make(chan *models.DashboardHistory, 100)

const MaxHistoriesCount = 50
const DeleteCount = 10

func InitHistory() {
	for {
		var history = <-historyCh
		dash := history.Dashboard
		// query how many histories does it has
		count := 0
		err := db.Conn.QueryRow("SELECT count(1) FROM dashboard_history WHERE dashboard_id=?", dash.Id).Scan(&count)
		if err != nil {
			logger.Warn("query history count error", "erorr", err)
			time.Sleep(1 * time.Second)
			continue
		}

		if count >= MaxHistoriesCount {
			// delete 5 least recently updated
			_, err := db.Conn.Exec("DELETE FROM dashboard_history WHERE dashboard_id=? ORDER BY version LIMIT ?", dash.Id, DeleteCount)
			if err != nil {
				logger.Warn("delete history count error", "erorr", err)
				time.Sleep(1 * time.Second)
				continue
			}
		}

		data, err := json.Marshal(dash)
		if err != nil {
			logger.Warn("marshal history error", "erorr", err)
			time.Sleep(1 * time.Second)
			continue
		}

		_, err = db.Conn.Exec("INSERT INTO dashboard_history (dashboard_id,version,changes,history) VALUES (?,?,?,?)", dash.Id, time.Now(), history.Changes, data)
		if err != nil {
			logger.Warn("marshal history error", "erorr", err)
			time.Sleep(1 * time.Second)
		}
	}
}

func GetHistory(c *gin.Context) {
	id := c.Param("id")
	rows, err := db.Conn.Query("SELECT history,version,changes FROM dashboard_history WHERE dashboard_id=? ORDER BY version DESC", id)
	if err != nil {
		logger.Warn("query dashboard history error", "error,err")
		c.JSON(http.StatusInternalServerError, common.RespError(e.Internal))
		return
	}

	histories := make([]*models.DashboardHistory, 0)
	for rows.Next() {
		var data []byte
		var t *time.Time
		var changes string
		rows.Scan(&data, &t, &changes)

		var dash *models.Dashboard
		err := json.Unmarshal(data, &dash)
		if err != nil {
			logger.Warn("unmarshal dashboard history error", "error", err)
			continue
		}
		dash.Updated = t

		history := &models.DashboardHistory{
			Dashboard: dash,
			Changes:   changes,
		}

		histories = append(histories, history)
	}

	c.JSON(http.StatusOK, common.RespSuccess(histories))
}
