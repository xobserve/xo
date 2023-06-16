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

var historyCh = make(chan *models.Dashboard, 100)

const MaxHistoriesCount = 50
const DeleteCount = 10

func InitHistory() {
	for {
		var dash = <-historyCh
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

		history, err := json.Marshal(dash)
		if err != nil {
			logger.Warn("marshal history error", "erorr", err)
			time.Sleep(1 * time.Second)
			continue
		}

		_, err = db.Conn.Exec("INSERT INTO dashboard_history (dashboard_id,version,history) VALUES (?,?,?)", dash.Id, time.Now(), history)
		if err != nil {
			logger.Warn("marshal history error", "erorr", err)
			time.Sleep(1 * time.Second)
		}
	}
}

func GetHistory(c *gin.Context) {
	id := c.Param("id")
	rows, err := db.Conn.Query("SELECT history,version FROM dashboard_history WHERE dashboard_id=? ORDER BY version DESC", id)
	if err != nil {
		logger.Warn("query dashboard history error", "error,err")
		c.JSON(http.StatusInternalServerError, common.RespError(e.Internal))
		return
	}

	dashboards := make([]*models.Dashboard, 0)
	for rows.Next() {
		var data []byte
		var t *time.Time
		rows.Scan(&data, &t)

		var dash *models.Dashboard
		err := json.Unmarshal(data, &dash)
		if err != nil {
			logger.Warn("unmarshal dashboard history error", "error", err)
			continue
		}
		dash.Updated = t
		dashboards = append(dashboards, dash)
	}

	c.JSON(http.StatusOK, common.RespSuccess(dashboards))
}
