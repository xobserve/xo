package plugins

import "github.com/DataObserve/datav/query/pkg/models"

/* Plugins for query data from databases */

var plugins = make(map[string]models.Plugin)

func Register(name string, p models.Plugin) {
	plugins[name] = p
}
