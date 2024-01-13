// Copyright 2023 xobserve.io Team
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

import (
	"context"
	"database/sql"
	"time"

	"github.com/xObserve/xObserve/query/pkg/common"
)

type Datasource struct {
	Id         int64             `json:"id"`
	Name       string            `json:"name"`
	Type       string            `json:"type"`
	URL        string            `json:"url"`
	Data       map[string]string `json:"data,omitempty"`
	TeamId     int64             `json:"teamId"`
	TemplateId int64             `json:"templateId"`
	Created    *time.Time        `json:"created,omitempty"`
	Updated    *time.Time        `json:"updated,omitempty"`
}

const (
	DatasourcePrometheus   = "prometheus"
	DatasourceJaeger       = "jaeger"
	DatasourceExternalHttp = "external-http"
	DatasourceTestData     = "testdata"
)

func CreateDatasourceInScope(ctx context.Context, scopeType int, scopeId int64, ds *Datasource, tx *sql.Tx) error {
	if scopeType == common.ScopeTeam {
		ds.TeamId = scopeId
		return ImportDatasource(ctx, ds, tx)
	}

	if scopeType == common.ScopeTenant {
		return CreateDatasourceInTenant(ctx, scopeId, ds, tx)
	}

	// scope website
	tenants, err := QueryAllTenantIds(ctx)
	if err != nil {
		return err
	}

	for _, tenantId := range tenants {
		err = CreateDatasourceInTenant(ctx, tenantId, ds, tx)
		if err != nil {
			return err
		}
	}

	return nil
}

func CreateDatasourceInTenant(ctx context.Context, tenantId int64, ds *Datasource, tx *sql.Tx) error {
	teamIds, err := QueryTenantAllTeamIds(tenantId)
	if err != nil {
		return err
	}

	for _, teamId := range teamIds {
		ds.TeamId = teamId
		err = ImportDatasource(ctx, ds, tx)
		if err != nil {
			return err
		}
	}

	return nil
}
