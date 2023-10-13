package models

import "github.com/gin-gonic/gin"

type Plugin interface {
	Query(c *gin.Context, ds *Datasource) interface{}
}

var plugins = make(map[string]Plugin)

func GetPlugin(name string) Plugin {
	return plugins[name]
}

func RegisterPlugin(name string, p Plugin) {
	plugins[name] = p
}
