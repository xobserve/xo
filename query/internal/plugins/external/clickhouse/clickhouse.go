package clickhouse

import (
	"fmt"

	"github.com/DataObserve/datav/query/internal/plugins"
)

/* Query plugin for clickhouse database */

type ClickHousePlugin struct{}

func (ds *ClickHousePlugin) Query(query string) interface{} {
	fmt.Println("query clickhouse database")

	return nil
}

func init() {
	// register datasource
	plugins.Register("clickhouse", &ClickHousePlugin{})
}
