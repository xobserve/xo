// Copyright 2023 xObserve.io Team

import { Panel, PanelDatasource, PanelQuery } from './dashboard'
import { Variable } from './variable'

export const defaultDatasourceId = 1

export interface Datasource {
  id: number
  name: string
  type: string
  url: string
  data?: { [key: string]: any }
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
