package models

import "time"

type AuditLog struct {
	OpId     int64       `json:"opId"`
	Operator *User       `json:"op"`
	OpType   string      `json:"opType"`
	TargetId string      `json:"targetId"`
	Data     interface{} `json:"data"`
	Created  time.Time   `json:"created"`
}
