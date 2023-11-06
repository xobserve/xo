package api

import (
	"fmt"
	"strconv"
	"strings"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/gin-gonic/gin"
	xobservemodels "github.com/xObserve/xObserve/query/internal/plugins/builtin/xobserve/models"
	xobserveutils "github.com/xObserve/xObserve/query/internal/plugins/builtin/xobserve/utils"
	pluginUtils "github.com/xObserve/xObserve/query/internal/plugins/utils"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/config"
	"github.com/xObserve/xObserve/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "observability")

type ServiceNameRes struct {
	ServiceName string `ch:"serviceName"`
}

func GetServiceNames(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	tenant := models.DefaultTenant
	domainQuery := xobserveutils.BuildBasicDomainQuery(tenant, params)

	query := fmt.Sprintf("SELECT DISTINCT serviceName FROM %s.%s WHERE %s", config.Data.Observability.DefaultTraceDB, xobservemodels.DefaultServiceOperationsTable, domainQuery)

	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query service names", "query", query)

	res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", res)
}

func GetServiceOperations(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	tenant := models.DefaultTenant
	domainQuery := xobserveutils.BuildBasicDomainQuery(tenant, params)

	service := xobserveutils.GetValueListFromParams(params, "service")
	if service != nil {
		domainQuery += fmt.Sprintf(" AND serviceName in ('%s')", strings.Join(service, "','"))
	}

	query := fmt.Sprintf("SELECT DISTINCT name FROM %s.%s WHERE %s", config.Data.Observability.DefaultTraceDB, xobservemodels.DefaultServiceOperationsTable, domainQuery)
	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		logger.Warn("Error Query service operations", "query", query, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query service operations", "query", query)

	res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", res)
}

func GetServiceRootOperations(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	tenant := models.DefaultTenant
	domainQuery := xobserveutils.BuildBasicDomainQuery(tenant, params)

	service := xobserveutils.GetValueListFromParams(params, "service")
	if service != nil {
		domainQuery += fmt.Sprintf(" AND serviceName in ('%s')", strings.Join(service, "','"))
	}

	query := fmt.Sprintf("SELECT DISTINCT name FROM %s.%s WHERE %s", config.Data.Observability.DefaultTraceDB, xobservemodels.DefaultTopLevelOperationsTable, domainQuery)
	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		logger.Warn("Error Query service operations", "query", query, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	logger.Info("Query service operations", "query", query)

	res, err := pluginUtils.ConvertDbRowsToPluginData(rows)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", res)
}

type ServiceInfo struct {
	ServiceName   string
	P99           float64
	AvgDuration   float64
	NumCalls      uint64
	NumOperations uint64
	NumErrors     uint64
}

func GetServiceInfoList(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	start, _ := strconv.ParseInt(c.Query("start"), 10, 64)
	end, _ := strconv.ParseInt(c.Query("end"), 10, 64)
	if start == 0 || end == 0 {
		return models.GenPluginResult(models.PluginStatusError, "start and end is required", nil)
	}

	tenant := models.DefaultTenant
	domainQuery := xobserveutils.BuildBasicDomainQuery(tenant, params)

	service := xobserveutils.GetValueListFromParams(params, "service")
	if service != nil {
		domainQuery += fmt.Sprintf(" AND serviceName in ('%s')", strings.Join(service, "','"))
	}

	serviceMap := make(map[string]*ServiceInfo)
	query := fmt.Sprintf(
		`SELECT serviceName, quantile(0.99)(duration) / 1e6 as p99, avg(duration) / 1e6  as avgDuration, count(DISTINCT traceId) as numCalls, count(*) as numOperations FROM %s.%s WHERE startTime>= %d AND startTime<= %d AND %s GROUP BY serviceName`,
		config.Data.Observability.DefaultTraceDB, xobservemodels.DefaultTraceIndexTable, start*1e9, end*1e9, domainQuery)

	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		logger.Warn("Error Query service operations", "query", query, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	for rows.Next() {
		var name string
		info := &ServiceInfo{}
		err := rows.Scan(&name, &info.P99, &info.AvgDuration, &info.NumCalls, &info.NumOperations)
		if err != nil {
			logger.Warn("Error scan service info", "error", err)
			continue
		}
		info.ServiceName = name
		serviceMap[name] = info
	}

	logger.Info("Query service operations", "query", query)

	query = fmt.Sprintf(
		`SELECT serviceName, count(DISTINCT traceId)  as numErrors FROM %s.%s WHERE startTime>= %d AND startTime<= %d AND %s AND statusCode=2  GROUP BY serviceName`,
		config.Data.Observability.DefaultTraceDB, xobservemodels.DefaultTraceIndexTable, start*1e9, end*1e9, domainQuery)

	rows, err = conn.Query(c.Request.Context(), query)
	if err != nil {
		logger.Warn("Error Query service operations", "query", query, "error", err)
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}
	defer rows.Close()

	for rows.Next() {
		var serviceName string
		var numErrors uint64

		err := rows.Scan(&serviceName, &numErrors)
		if err != nil {
			logger.Warn("Error scan service error", "error", err)
			continue
		}

		info, ok := serviceMap[serviceName]
		if ok {
			info.NumErrors = numErrors
		}
	}

	columns := []string{"serviceName", "p99", "avgDuration", "numCalls", "numOperations", "numErrors"}
	data := make([][]interface{}, 0, len(serviceMap))

	for name, info := range serviceMap {
		data = append(data, []interface{}{
			name,
			info.P99,
			info.AvgDuration,
			info.NumCalls,
			info.NumOperations,
			info.NumErrors,
		})
	}
	return models.GenPluginResult(models.PluginStatusSuccess, "", models.PluginResultData{
		Columns: columns,
		Data:    data,
	})
}
