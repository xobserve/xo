// Copyright 2023 xobserve.io Team
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
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xobserve/xo/query/pkg/common"
	"github.com/xobserve/xo/query/pkg/config"
	"github.com/xobserve/xo/query/pkg/db"
	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/models"
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
		err := db.Conn.QueryRow("SELECT count(1) FROM dashboard_history WHERE team_id=? and dashboard_id=?", dash.OwnedBy, dash.Id).Scan(&count)
		if err != nil {
			logger.Warn("query history count error", "erorr", err)
			time.Sleep(1 * time.Second)
			continue
		}

		if count >= MaxHistoriesCount {
			// delete 5 least recently updated
			var err error
			if config.Data.Database.ConnectTo == "sqlite" {
				_, err = db.Conn.Exec("DELETE FROM dashboard_history WHERE team_id=? and dashboard_id=? and version IN (SELECT version FROM dashboard_history WHERE team_id=? and dashboard_id=? ORDER BY version LIMIT ? )", dash.OwnedBy, dash.Id, dash.OwnedBy, dash.Id, DeleteCount)

			} else {
				_, err = db.Conn.Exec("DELETE FROM dashboard_history WHERE team_id=? and dashboard_id=? ORDER BY version LIMIT ?", dash.OwnedBy, dash.Id, DeleteCount)
			}
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

		_, err = db.Conn.Exec("INSERT INTO dashboard_history (team_id,dashboard_id,version,changes,history) VALUES (?,?,?,?,?)", dash.OwnedBy, dash.Id, time.Now(), history.Changes, data)
		if err != nil {
			logger.Warn("marshal history error", "erorr", err)
			time.Sleep(1 * time.Second)
		}
	}
}

func GetHistory(c *gin.Context) {
	teamId, _ := strconv.ParseInt(c.Param("teamId"), 10, 64)
	id := c.Param("id")

	rows, err := db.Conn.QueryContext(c.Request.Context(), "SELECT history,version,changes FROM dashboard_history WHERE team_id=? and dashboard_id=? ORDER BY version DESC", teamId, id)
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
