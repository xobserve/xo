package models

import (
	"github.com/code-creatively/datav/backend/pkg/utils/simplejson"
)

type Annotation struct {
	Id          int64            `json:"id"`
	DashboardId int64            `json:"dashboardId"`
	PanelId     int64            `json:"panelId"`
	Text        string           `json:"text"`
	AlertId     int64            `json:"alertId"`
	PrevState   string           `json:"prevState"`
	NewState    string           `json:"newState"`
	Data        *simplejson.Json `json:"data"`
	Time        int64            `json:"time"`
	TimeEnd     int64            `json:"timeEnd"`
	Tags        []string         `json:"tags"`
	CreatedBy   int64            `json:"createdBy"`
	Created     int64            `json:"created"`
	Updated     int64            `json:"updated"`
}

type AnnotationQuery struct {
	Id           int64    `json:"id"`
	From         int64    `json:"from"`
	To           int64    `json:"to"`
	UserId       int64    `json:"userId"`
	AlertId      int64    `json:"alertId"`
	DashboardId  int64    `json:"dashboardId"`
	PanelId      int64    `json:"panelId"`
	AnnotationId int64    `json:"annotationId"`
	Tags         []string `json:"tags"`
	Type         string   `json:"type"`
	MatchAny     bool     `json:"matchAny"`

	Limit int64 `json:"limit"`
}

type AnnotationRepo interface {
	Create(ann *Annotation) error
	Update(ann *Annotation) error
	Find(query *AnnotationQuery) ([]*Annotation, error)
	Delete(id int64) error
}

var annotationRepoInstance AnnotationRepo

func GetAnnotationRep() AnnotationRepo {
	return annotationRepoInstance
}

func SetAnnotationRepo(rep AnnotationRepo) {
	annotationRepoInstance = rep
}
