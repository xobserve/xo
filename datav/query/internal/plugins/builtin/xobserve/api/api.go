package api

import (
	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/gin-gonic/gin"
	"github.com/xobserve/xo/query/pkg/models"
)

const (
	TestDatasourceAPI           = "testDatasource"
	GetServiceInfoListAPI       = "getServiceInfoList"
	GetNamespacesAPI            = "getNamespaces"
	GetServiceNamesAPI          = "getServiceNames"
	GetServiceOperationsAPI     = "getServiceOperations"
	GetServiceRootOperationsAPI = "getServiceRootOperations"
	GetDependencyGraphAPI       = "getDependencyGraph"
	GetLogsAPI                  = "getLogs"
	GetTracesAPI                = "getTraces"
	GetTraceAPI                 = "getTrace"
	GetTraceTagKeysAPI          = "getTraceTagKeys"
)

var APIRoutes = map[string]func(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult{
	GetServiceInfoListAPI:       GetServiceInfoList,
	GetNamespacesAPI:            GetNamespaces,
	GetServiceNamesAPI:          GetServiceNames,
	GetServiceOperationsAPI:     GetServiceOperations,
	GetServiceRootOperationsAPI: GetServiceRootOperations,
	GetLogsAPI:                  GetLogs,
	GetDependencyGraphAPI:       GetDependencyGraph,
	GetTracesAPI:                GetTraces,
	GetTraceAPI:                 GetTrace,
	GetTraceTagKeysAPI:          GetTraceTagKeys,
}
