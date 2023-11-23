package task

import (
	"context"
	"time"

	"github.com/xObserve/xObserve/query/internal/admin"
	"github.com/xObserve/xObserve/query/internal/tenant"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/config"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "task")

func Init() {
	for {
		now := time.Now()
		hour := now.Hour()
		if hour == 3 {
			// delete annotations
			expires := now.Add(-1 * time.Duration(config.Data.Task.CleanAnnotations) * time.Hour * 24)

			res, err := db.Conn.Exec("DELETE FROM annotation WHERE created < ?", expires)
			if err != nil {
				logger.Error("task: clean annotation", "error", err)
			} else {
				n, _ := res.RowsAffected()
				logger.Info("Task: remove annotations", "count", n)
			}

			expires = now.Add(-1 * time.Duration(config.Data.Task.DeleteAfterDays) * time.Hour * 24)

			// delete teams
			rows, err := db.Conn.Query("SELECT id FROM team WHERE status=? and statusUpdated < ?", common.StatusDeleted, expires)
			if err != nil {
				logger.Error("task: query team", "error", err)
			} else {
				teamIds := make([]int64, 0)
				for rows.Next() {
					var teamId int64
					err := rows.Scan(&teamId)
					if err != nil {
						logger.Error("task: scan team", "error", err)
						continue
					}

					teamIds = append(teamIds, teamId)
				}
				rows.Close()
				for _, teamId := range teamIds {
					tx, err := db.Conn.Begin()
					if err != nil {
						logger.Error("task: begin sql transaction", "error", err)
						continue
					}

					err = models.DeleteTeam(context.Background(), teamId, tx)
					if err != nil {
						tx.Rollback()
						logger.Error("task: delete team", "error", err)
					}

					err = tx.Commit()
					if err != nil {
						logger.Error("task: commit sql transaction", "error", err)
					}
				}

				logger.Info("Task: remove teams", "teamIds", teamIds)
			}

			// delete users
			rows, err = db.Conn.Query("SELECT id FROM user WHERE status=? and statusUpdated < ?", common.StatusDeleted, expires)
			if err != nil {
				logger.Error("task: query user", "error", err)
			} else {
				userIds := make([]int64, 0)
				for rows.Next() {
					var userId int64
					err := rows.Scan(&userId)
					if err != nil {
						logger.Error("task: scan user", "error", err)
						continue
					}

					userIds = append(userIds, userId)
				}
				rows.Close()
				for _, userId := range userIds {
					err := admin.DeleteUser(userId)
					if err != nil {
						logger.Error("task: delete user", "error", err)
					}
				}

				logger.Info("Task: remove users", "userIds", userIds)
			}

			// delete tenants
			rows, err = db.Conn.Query("SELECT id FROM tenant WHERE status=? and statusUpdated < ?", common.StatusDeleted, expires)
			if err != nil {
				logger.Error("task: query tenant", "error", err)
			} else {
				tenantIds := make([]int64, 0)
				for rows.Next() {
					var tenantId int64
					err := rows.Scan(&tenantId)
					if err != nil {
						logger.Error("task: scan tenant", "error", err)
						continue
					}

					tenantIds = append(tenantIds, tenantId)
				}
				rows.Close()
				for _, tenantId := range tenantIds {
					err := tenant.DeleteTenant(tenantId)
					if err != nil {
						logger.Error("task: delete tenant", "error", err)
					}
				}

				logger.Info("Task: remove tenants", "tenantIds", tenantIds)
			}
		}

		time.Sleep(1 * time.Hour)
	}
}
