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
	"github.com/xObserve/xObserve/query/pkg/e"
)

type Variable struct {
	Id          int64     `json:"id"`
	Name        string    `json:"name"`
	Type        string    `json:"type"`
	Value       string    `json:"value"`
	Default     *string   `json:"default"` // default selected
	Datasource  int       `json:"datasource"`
	Desc        string    `json:"description"`
	Created     time.Time `json:"created"`
	Refresh     string    `json:"refresh"`
	EnableMulti bool      `json:"enableMulti"`
	EnableAll   bool      `json:"enableAll"`
	Regex       *string   `json:"regex"`
	SortWeight  int       `json:"sortWeight"`
	TeamId      int64     `json:"teamId"`
	TemplateId  int64     `json:"templateId"`
}

const VarialbeAllOption = "__all__"

func CreateVariableInScope(ctx context.Context, scopeType int, scopeId int64, v *Variable, tx *sql.Tx) error {
	if scopeType == common.ScopeTeam {
		v.TeamId = scopeId
		return ImportVariable(ctx, v, tx, true)
	}

	if scopeType == common.ScopeTenant {
		return CreateVariableInTenant(ctx, scopeId, v, tx)
	}

	// scope website
	tenants, err := QueryAllTenantIds(ctx)
	if err != nil {
		return err
	}

	for _, tenantId := range tenants {
		err = CreateVariableInTenant(ctx, tenantId, v, tx)
		if err != nil {
			return err
		}
	}

	return nil
}

func CreateVariableInTenant(ctx context.Context, tenantId int64, v *Variable, tx *sql.Tx) error {
	teamIds, err := QueryTenantAllTeamIds(tenantId)
	if err != nil {
		return err
	}

	for _, teamId := range teamIds {
		v.TeamId = teamId
		err = ImportVariable(ctx, v, tx, true)
		if err != nil && !e.IsErrUniqueConstraint(err) {
			return err
		}
	}

	return nil
}
