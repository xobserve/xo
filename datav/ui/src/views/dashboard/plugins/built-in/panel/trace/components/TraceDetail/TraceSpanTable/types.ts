// Copyright (c) 2020 The Jaeger Authors.
//

import { ColumnFilterItem } from 'antd/es/table/interface'

export interface ITableSpan {
  traceID: string
  type: string
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
  isDetail: boolean
  parentElement: string
  color: string // If it is a service name, the color will be set.
  searchColor: string
  colorToPercent: string // Color created by percent
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

export interface IFilterDropdownProps {
  prefixCls?: string
  setSelectedKeys?: (selectedKeys: string[]) => void
  selectedKeys: string[]
  confirm: () => void
  clearFilters: () => void
  filters?: ColumnFilterItem[]
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement
}
