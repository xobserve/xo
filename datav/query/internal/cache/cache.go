package cache

import "github.com/xobserve/xo/query/internal/datasource"

func Init() {
	go datasource.InitDatasources()
}
