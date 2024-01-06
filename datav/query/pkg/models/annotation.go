package models

import "time"

type Annotation struct {
	Id          int64    `json:"id"`
	Text        string   `json:"text"`
	Time        int64    `json:"time"`
	Duration    string   `json:"duration"`
	Tags        []string `json:"tags"`
	NamespaceId string   `json:"namespace"`
	GroupId     int      `json:"group"`

	UserId  int64      `json:"userId"`
	TeamId  int64      `json:"teamId"`
	Created time.Time  `json:"created"`
	Updated *time.Time `json:"updated,omitempty"`
}
