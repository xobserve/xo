// Copyright (c) 2020 The Jaeger Authors.
//

export interface ITableSpan {
  hasSubgroupValue: boolean // True when the entry has the subgroup tag in it.
  name: string
  count: number
  total: number
  avg: number
  min: number
  max: number
  selfTotal: number
  selfAvg: number
  selfMin: number
  selfMax: number
  percent: number
  isDetail: boolean // True when the entry represents a subgroup aggregation.
  parentElement: string
  color: string // If it is a service name, the color will be set.
  searchColor: string
  colorToPercent: string // Color created by percent
  traceID: string
}

export interface ITableValues {
  uid: string
  value: number
}

export interface IColumnValue {
  title: string
  attribute: string
  suffix: string
  isDecimal: boolean
}
