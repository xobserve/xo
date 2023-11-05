package admin

import (
	"context"
	"encoding/json"
	"time"

	"github.com/DataObserve/observex/query/pkg/common"
	"github.com/DataObserve/observex/query/pkg/db"
	"github.com/DataObserve/observex/query/pkg/models"
	"github.com/gin-gonic/gin"
)

func QueryAuditLogs(c *gin.Context) {
	rows, err := db.Conn.QueryContext(c.Request.Context(), "SELECT op_id,op_type,target_id,data,created FROM audit_logs ORDER BY created DESC")
	if err != nil {
		logger.Warn("query audit logs error", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}
	defer rows.Close()

	logs := make([]*models.AuditLog, 0)
	for rows.Next() {
		var rawData []byte
		log := &models.AuditLog{}
		err := rows.Scan(&log.OpId, &log.OpType, &log.TargetId, &rawData, &log.Created)
		if err != nil {
			logger.Warn("scan audit logs error", "error", err)
			continue
		}
		log.Operator, _ = models.QueryUserById(c.Request.Context(), log.OpId)
		log.Data = string(rawData)
		logs = append(logs, log)
	}

	c.JSON(200, common.RespSuccess(logs))
}

const (
	AuditDeleteDashboard  = "dashboard.delete"
	AuditDeleteUser       = "user.delete"
	AuditEditUser         = "user.edit"
	AuditDeleteTeam       = "team.delete"
	AuditEditTeam         = "team.edit"
	AuditEditDatasource   = "datasource.edit"
	AuditDeleteDatasource = "datasource.delete"
)

func WriteAuditLog(ctx context.Context, opId int64, opType string, targetId string, data interface{}) {
	now := time.Now()
	d, err := json.Marshal(data)
	if err != nil {
		logger.Warn("json encode audit log  erorr", "error", err)
		return
	}

	_, err = db.Conn.ExecContext(ctx, "INSERT INTO audit_logs (op_id,op_type,target_id,data,created) VALUES (?,?,?,?,?)",
		opId, opType, targetId, d, now)
	if err != nil {
		logger.Warn("write audit log  erorr", "error", err)
	}
}
