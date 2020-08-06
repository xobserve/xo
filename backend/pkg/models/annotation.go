package models

import (
	
)

type Annotation struct {
	Id          int64            `json:"id"`
	DashboardId int64            `json:"dashboardId"`
	PanelId     int64            `json:"panelId"`
	Text        string           `json:"text"`
	AlertId     int64            `json:"alertId"`
	Time       int64            `json:"time"`
	TimeEnd    int64            `json:"timeEnd"`
	Tags        []string         `json:"tags"`
	CreatedBy   int64            `json:"createdBy"`
	Created     int64            `json:"created"`
	Updated     int64            `json:"updated"`
}