package models

type Plugin interface {
	Query(query string) interface{}
}
