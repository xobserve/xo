package clickhouse

import (
	"fmt"

	"github.com/DataObserve/datav/query/pkg/models"
)

/* Query plugin for clickhouse database */

type ClickHousePlugin struct{}

func (ds *ClickHousePlugin) Query(query string) interface{} {
	fmt.Println("query clickhouse database")

	return nil
}

func init() {
	// register datasource
	models.RegisterPlugin("clickhouse", &ClickHousePlugin{})
}
