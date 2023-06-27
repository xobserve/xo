package models

import "time"

type Datasource struct {
	Id      int64       `json:"id"`
	Name    string      `json:"name"`
	Type    string      `json:"type"`
	URL     string      `json:"url"`
	Data    interface{} `json:"data,omitempty"`
	Created *time.Time  `json:"created,omitempty"`
	Updated *time.Time  `json:"updated,omitempty"`
}

const (
	DatasourcePrometheus   = "prometheus"
	DatasourceJaeger       = "jaeger"
	DatasourceExternalHttp = "external-http"
	DatasourceTestData     = "testdata"
)

const InitTestDataDatasourceId = 1
