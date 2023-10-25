package api

import (
	"fmt"
	"strconv"
	"strings"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	datavmodels "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/models"
	pluginUtils "github.com/DataObserve/datav/query/internal/plugins/utils"
	"github.com/DataObserve/datav/query/pkg/colorlog"
	"github.com/DataObserve/datav/query/pkg/config"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

var logger = colorlog.RootLogger.New("logger", "observability")

type ServiceNameRes struct {
	ServiceName string `ch:"serviceName"`
}

func GetServiceNames(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult {
	query := fmt.Sprintf("SELECT DISTINCT serviceName FROM %s.%s", config.Data.Observability.DefaultTraceDB, datavmodels.DefaultTopLevelOperationsTable)

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
	serviceI := params["service"]
	if serviceI == nil {
		return models.GenPluginResult(models.PluginStatusError, "service is required", nil)
	}

	service := serviceI.(string)

	query := fmt.Sprintf("SELECT DISTINCT name FROM %s.%s WHERE serviceName='%s'", config.Data.Observability.DefaultTraceDB, datavmodels.DefaultTopLevelOperationsTable, service)
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

	serviceFilter := ""
	serviceI := params["service"]
	serviceNames := make([]string, 0)
	if serviceI != nil {
		service := serviceI.(string)
		serviceFilter = " serviceName IN @serviceNames AND"
		serviceNames = strings.Split(service, "|")
	}

	serviceMap := make(map[string]*ServiceInfo)
	query := fmt.Sprintf(
		`SELECT
			serviceName,
			quantile(0.99)(durationNano) / 1e6 as p99,
			avg(durationNano) / 1e6  as avgDuration,
			count(DISTINCT traceID) as numCalls,
			count(*) as numOperations
		FROM %s.%s
		WHERE %s timestamp>= %d AND timestamp<= %d
		GROUP BY serviceName`,
		config.Data.Observability.DefaultTraceDB, datavmodels.DefaultIndexTable, serviceFilter, start, end)
	args := []interface{}{}
	args = append(args,
		ch.Named("serviceNames", serviceNames),
	)

	rows, err := conn.Query(c.Request.Context(), query, args...)
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
		`SELECT
			serviceName,
			count(DISTINCT traceID)  as numErrors
		FROM %s.%s
		WHERE %s timestamp>= %d AND timestamp<= %d AND statusCode=2
		GROUP BY serviceName`,
		config.Data.Observability.DefaultTraceDB, datavmodels.DefaultIndexTable, serviceFilter, start, end)

	rows, err = conn.Query(c.Request.Context(), query, args...)
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
