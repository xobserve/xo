package admin

import (
	"context"
	"encoding/json"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

func QueryAuditLogs(c *gin.Context) {
	u := c.MustGet("currentUser").(*models.User)

	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

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
		log.Operator, err = models.QueryUserById(c.Request.Context(), log.OpId)
		if err != nil {
			logger.Warn("query user error", "error", err)
		}
		log.Data = string(rawData)
		logs = append(logs, log)
	}

	c.JSON(200, common.RespSuccess(logs))
}

const (
	AuditDeleteDashboard  = "dashboard.delete"
	AuditDeleteUser       = "user.delete"
	AuditRestoreUser      = "user.restore"
	AuditEditUser         = "user.edit"
	AuditDeleteTeam       = "team.delete"
	AuditRestoreTeam      = "team.restore"
	AuditEditTeam         = "team.edit"
	AuditEditDatasource   = "datasource.edit"
	AuditDeleteDatasource = "datasource.delete"
)

func WriteAuditLog(ctx context.Context, tenantId int64, teamId int64, opId int64, opType string, targetId string, data interface{}) {
	now := time.Now()
	d, err := json.Marshal(data)
	if err != nil {
		logger.Warn("json encode audit log  erorr", "error", err)
		return
	}

	_, err = db.Conn.ExecContext(ctx, "INSERT INTO audit_logs (tenant_id,team_id,op_id,op_type,target_id,data,created) VALUES (?,?,?,?,?,?,?)",
		tenantId, teamId, opId, opType, targetId, d, now)
	if err != nil {
		logger.Warn("write audit log  erorr", "error", err)
	}
}
