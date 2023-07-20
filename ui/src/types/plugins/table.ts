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

// A query result may contains multiple series and each series corrosponds to a table
// e.g a query to prometheus usually returns a matrix result, which contains multiple series

import type { ColumnType } from 'antd/es/table';

export interface TableSeries {
    name: string // series name,
    rawName: Object
    columns: TableColumn[]// table columns
    rows: TableRow[] // table data, each item in data list is a table row: key is the column name, value is the corresponding row value
}

export interface TableColumn extends ColumnType<TableRow> {
    dataIndex: string
}

export interface TableRow {
    __bg__?: any
    __value__?: any
    [columnName:string]: number | string
}

// Every datasource plugin must return a TablePluginData to Table panel
export type TablePluginData = TableSeries[]