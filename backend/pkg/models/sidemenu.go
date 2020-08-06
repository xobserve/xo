package models

const (
	DefaultMenuId   = 1
	DefaultMenuDesc = "default menu"
)

type SideMenu struct {
	Id     int64       `json:"id"`
	TeamId int64       `json:"teamId"`
	TeamName string    `json:"teamName"`
	Desc   string      `json:"desc"`
	Data   interface{} `json:"data"`
}
