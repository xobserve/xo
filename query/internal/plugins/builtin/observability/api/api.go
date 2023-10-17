package api

import (
	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

const (
	TestDatasourceAPI     = "testDatasource"
	GetServiceInfoListAPI = "getServiceInfoList"
	GetServiceNamesAPI    = "getServiceNames"
)

var APIRoutes = map[string]func(c *gin.Context, ds *models.Datasource, conn ch.Conn) models.PluginResult{
	GetServiceInfoListAPI: GetServiceInfoList,
	GetServiceNamesAPI:    GetServiceNames,
}
