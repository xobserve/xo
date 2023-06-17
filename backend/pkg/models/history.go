package models

type DashboardHistory struct {
	Dashboard *Dashboard `json:"dashboard"`
	Changes   string     `json:"changes"` // describle what has been changed in this history
}
