package models

import "time"

const (
	CustomValuesVariable     = "1"
	GetByHttpVariable        = "2"
	BackendHardcodedVariable = "3"
)

type Variable struct {
	Id          int64     `json:"id"`
	Name        string    `json:"name"`
	Type        string    `json:"type"`
	Value       string    `json:"value"`
	ExternalUrl string    `json:"externalUrl"`
	Brief       string    `json:"brief"`
	Created     time.Time `json:"created"`
}
