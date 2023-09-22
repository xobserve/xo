// Copyright (c) 2020 The Jaeger Authors.
//
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

import { ColumnFilterItem } from 'antd/es/table/interface';

export interface ITableSpan {
  traceID: string;
  type: string;
  name: string;
  count: number;
  total: number;
  avg: number;
  min: number;
  max: number;
  selfTotal: number;
  selfAvg: number;
  selfMin: number;
  selfMax: number;
  percent: number;
  isDetail: boolean;
  parentElement: string;
  color: string; // If it is a service name, the color will be set.
  searchColor: string;
  colorToPercent: string; // Color created by percent
}

export interface ITableValues {
  uid: string;
  value: number;
}

export interface IColumnValue {
  title: string;
  attribute: string;
  suffix: string;
  isDecimal: boolean;
}

export interface IFilterDropdownProps {
  prefixCls?: string;
  setSelectedKeys?: (selectedKeys: string[]) => void;
  selectedKeys: string[];
  confirm: () => void;
  clearFilters: () => void;
  filters?: ColumnFilterItem[];
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
}
