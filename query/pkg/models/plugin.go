package models

import (
	"reflect"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/gin-gonic/gin"
)

const (
	PluginStatusSuccess = "success"
	PluginStatusError   = "error"
)

type PluginResult struct {
	Status string      `json:"status"`
	Error  string      `json:"error,omitempty"`
	Data   interface{} `json:"data,omitempty"`
}

const (
	PluginResultFormatTable   = "table"
	PluginResultFormatMetrics = "metrics"
	PluginResultFormatTrace   = "traces"
	PluginResultFormatLog     = "logs"
)

type PluginResultData struct {
	Columns     []string          `json:"columns"`
	Data        [][]interface{}   `json:"data"`
	ColumnTypes map[string]string `json:"types,omitempty"`
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

func ConvertDbRowsToPluginData(rows driver.Rows) (*PluginResultData, error) {
	columns := rows.Columns()
	columnTypes := rows.ColumnTypes()
	types := make(map[string]string)
	data := make([][]interface{}, 0)
	for rows.Next() {
		v := make([]interface{}, len(columns))
		for i := range v {
			t := columnTypes[i].ScanType()
			v[i] = reflect.New(t).Interface()

			tp := t.String()
			if tp == "time.Time" {
				types[columns[i]] = "time"
			}
		}

		err := rows.Scan(v...)
		if err != nil {
			return nil, err
		}

		for i, v0 := range v {
			v1, ok := v0.(*time.Time)
			if ok {
				v[i] = v1.Unix()
			}
		}

		data = append(data, v)
	}

	return &PluginResultData{
		Columns:     columns,
		Data:        data,
		ColumnTypes: types,
	}, nil
}
