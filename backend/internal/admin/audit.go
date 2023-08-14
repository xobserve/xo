package admin

import (
	"encoding/json"
	"time"

	"github.com/DataObserve/datav/backend/pkg/db"
)

const (
	AuditDeleteDashboard  = "dashboard.delete"
	AuditDeleteUser       = "user.delete"
	AuditEditUser         = "user.edit"
	AuditDeleteTeam       = "team.delete"
	AuditEditTeam         = "team.edit"
	AuditEditDatasource   = "datasource.edit"
	AuditDeleteDatasource = "datasource.delete"
)

func WriteAuditLog(userId int64, opType string, targetId string, data interface{}) {
	now := time.Now()
	d, err := json.Marshal(data)
	if err != nil {
		logger.Warn("json encode audit log  erorr", "error", err)
		return
	}

	_, err = db.Conn.Exec("INSERT INTO audit_logs (op_id,op_type,target_id,data,created) VALUES (?,?,?,?,?)",
		userId, opType, targetId, d, now)
	if err != nil {
		logger.Warn("write audit log  erorr", "error", err)
	}
}
