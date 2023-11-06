package cache

import "github.com/DataObserve/observex/query/internal/datasource"

func Init() {
	go datasource.InitDatasources()
}
