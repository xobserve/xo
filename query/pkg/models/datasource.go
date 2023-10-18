// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package models

import "time"

type Datasource struct {
	Id      int64             `json:"id"`
	Name    string            `json:"name"`
	Type    string            `json:"type"`
	URL     string            `json:"url"`
	Data    map[string]string `json:"data,omitempty"`
	TeamId  int64             `json:"teamId"`
	Created *time.Time        `json:"created,omitempty"`
	Updated *time.Time        `json:"updated,omitempty"`
}

const (
	DatasourcePrometheus   = "prometheus"
	DatasourceJaeger       = "jaeger"
	DatasourceExternalHttp = "external-http"
	DatasourceTestData     = "testdata"
)

const InitTestDataDatasourceId = 1
