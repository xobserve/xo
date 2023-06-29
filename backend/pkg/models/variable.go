package models

import "time"

type Variable struct {
	Id          int64     `json:"id"`
	Name        string    `json:"name"`
	Type        string    `json:"type"`
	Value       string    `json:"value"`
	Datasource  int       `json:"datasource"`
	Desc        string    `json:"description"`
	Created     time.Time `json:"created"`
	Refresh     string    `json:"refresh"`
	EnableMulti bool      `json:"enableMulti"`
	EnableAll   bool      `json:"enableAll"`
}
