package api

import (
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

func TestDatasource(c *gin.Context, ds *models.Datasource) models.PluginResult {
	return models.GenPluginResult(models.PluginStatusSuccess, "", nil)
}
