package cache

import "github.com/DataObserve/datav/query/internal/datasource"

func Init() {
	go datasource.InitDatasources()
}
