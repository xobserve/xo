// Copyright 2023 xObserve.io Team

export interface Variable {
  id?: number
  name: string
  type: string
  datasource?: number
  value?: string // query statement
  default?: string
  description?: string
  created?: string
  values?: string[]
  selected?: string
  regex?: string
  refresh?: VariableRefresh
  enableMulti?: boolean
  enableAll?: boolean
  sortWeight?: number
  teamId?: number
}

export enum VariableQueryType {
  Custom = 'custom',
  Query = 'query',
  Datasource = 'datasource',
  TextInput = 'textinput',
}

export enum VariableRefresh {
  OnDashboardLoad = 'OnDashboardLoad',
  OnTimeRangeChange = 'OnTimeRangeChange',
  Manually = 'Manually',
}
