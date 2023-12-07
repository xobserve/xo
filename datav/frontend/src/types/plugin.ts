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

import { Panel, PanelDatasource, PanelQuery } from 'types/dashboard'
import { TimeRange } from 'types/time'

export interface PanelPluginComponents {
  panel: any
  editor: any
  overrideEditor?: any
  overrideRules?: any
  getOverrideTargets?: (panel, data) => any
  mockDataForTestDataDs?: (
    panel: Panel,
    timeRange: TimeRange,
    ds: PanelDatasource,
    q: PanelQuery,
  ) => any // mock result data  when querying from TestData datasource
  settings: {
    type: string
    icon: string
    initOptions: Record<string, any>
    disableAutoQuery?: boolean
  }
}

export interface DatasourcePluginComponents {
  datasourceEditor: any // editor in add/edit datasource page
  variableEditor?: any // editor in variable editor page
  queryEditor?: any // edtidor in panel editor page
  getDocs?: any //docs showing in panel editor

  runQuery: any // run a query to datasource an get result data
  replaceQueryWithVariables?: any // replace above query with variables

  testDatasource: any // test datasource connection status, used in add/edit datasource page

  queryVariableValues?: any // query variable values from datasource, used in variable editor page

  queryAlerts?: any // query alerts from datasource, used in Alert panel

  settings: {
    type: string
    icon: string
    disabled?: () => boolean
  }
}

export interface QueryPluginResult {
  status: 'success' | 'error'
  error: string
  data: QueryPluginData
}

export interface QueryPluginData {
  columns: string[]
  data: any
  types: Record<string, string>
}
