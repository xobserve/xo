package models

import "github.com/gin-gonic/gin"

const (
	PluginStatusSuccess = "success"
	PluginStatusError   = "error"
)

type PluginResult struct {
	Status string      `json:"status"`
	Error  string      `json:"error,omitempty"`
	Data   interface{} `json:"data,omitempty"`
}

type Plugin interface {
	Query(c *gin.Context, ds *Datasource) PluginResult
}

var plugins = make(map[string]Plugin)

func GetPlugin(name string) Plugin {
	return plugins[name]
}

func RegisterPlugin(name string, p Plugin) {
	plugins[name] = p
}

func GenPluginResult(status, err string, data interface{}) PluginResult {
	return PluginResult{
		Status: status,
		Error:  err,
		Data:   data,
	}
}
