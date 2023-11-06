package cache

import "github.com/xObserve/xObserve/query/internal/datasource"

func Init() {
	go datasource.InitDatasources()
}
