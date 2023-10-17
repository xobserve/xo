package api

import (
	"fmt"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/DataObserve/datav/query/pkg/colorlog"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

var logger = colorlog.RootLogger.New("logger", "observability")

type ServiceNameRes struct {
	ServiceName string `ch:"serviceName"`
}

func GetServiceNames(c *gin.Context, ds *models.Datasource, conn ch.Conn) models.PluginResult {
	start := c.Query("start")
	end := c.Query("end")
	query := fmt.Sprintf("SELECT serviceName FROM signoz_traces.distributed_signoz_index_v2 WHERE timestamp >= %s AND timestamp <= %s GROUP BY serviceName", start, end)

	var res []ServiceNameRes
	err := conn.Select(c.Request.Context(), &res, query)
	if err != nil {
		return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	}

	logger.Info("Query service names", "query", query)

	columns := []string{"service"}
	data := make([][]interface{}, 0)
	for _, v := range res {
		data = append(data, []interface{}{v.ServiceName})
	}

	return models.GenPluginResult(models.PluginStatusSuccess, "", models.PluginResultData{
		Columns: columns,
		Data:    data,
	})
}

func GetServiceInfoList(c *gin.Context, ds *models.Datasource, conn ch.Conn) models.PluginResult {
	fmt.Println("here33333")
	// rows, err := conn.Query(c.Request.Context(), query)
	// if err != nil {
	// 	colorlog.RootLogger.Info("Error query clickhouse :", "error", err, "ds_id", ds.Id, "query:", query)
	// 	return models.GenPluginResult(models.PluginStatusError, err.Error(), nil)
	// }
	// defer rows.Close()

	// columns := rows.Columns()
	// columnTypes := rows.ColumnTypes()
	// types := make(map[string]string)
	// data := make([][]interface{}, 0)
	// for rows.Next() {
	// 	v := make([]interface{}, len(columns))
	// 	for i := range v {
	// 		t := columnTypes[i].ScanType()
	// 		v[i] = reflect.New(t).Interface()

	// 		tp := t.String()
	// 		if tp == "time.Time" {
	// 			types[columns[i]] = "time"
	// 		}
	// 	}

	// 	err = rows.Scan(v...)
	// 	if err != nil {
	// 		colorlog.RootLogger.Info("Error scan clickhouse :", "error", err, "ds_id", ds.Id)
	// 		continue
	// 	}

	// 	for i, v0 := range v {
	// 		v1, ok := v0.(*time.Time)
	// 		if ok {
	// 			v[i] = v1.Unix()
	// 		}
	// 	}

	// 	data = append(data, v)
	// }
	return models.GenPluginResult(models.PluginStatusSuccess, "", nil)
}
