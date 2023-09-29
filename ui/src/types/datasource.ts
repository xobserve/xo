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
import {  Panel, PanelDatasource, PanelQuery } from "./dashboard"
import { Variable } from "./variable"

export const defaultDatasourceId = 1

export interface Datasource {
    id: number 
    name: string
    type: string
    url: string
    data?: {[key: string]: any}
    teamId?: number
    created?: string 
    updated?: string
}

export interface DatasourceEditorProps {
    panel?: Panel
    datasource: PanelDatasource
    query: PanelQuery
    onChange: any
}

export interface DatasourceVariableEditorProps {
    variable: Variable
    onChange: any
    onQueryResult: any
}