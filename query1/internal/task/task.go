package task

import (
	"time"

	"github.com/DataObserve/datav/query/pkg/colorlog"
	"github.com/DataObserve/datav/query/pkg/config"
	"github.com/DataObserve/datav/query/pkg/db"
)

var logger = colorlog.RootLogger.New("logger", "task")

func Init() {
	for {
		now := time.Now()
		hour := now.Hour()
		if hour == 3 {
			expires := now.Add(-1 * time.Duration(config.Data.Task.CleanAnnotations) * time.Hour * 24)

			res, err := db.Conn.Exec("DELETE FROM annotation WHERE created < ?", expires)
			if err != nil {
				logger.Error("task: clean annotation", "error", err)
				goto SLEEP
			}
			n, _ := res.RowsAffected()
			logger.Info("Task: remove annotations", "count", n)
		}
	SLEEP:
		time.Sleep(1 * time.Hour)
	}
}
