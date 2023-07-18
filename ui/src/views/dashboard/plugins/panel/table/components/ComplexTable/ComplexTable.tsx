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
import React, { memo } from 'react';
import { Table } from 'antd';
import { TableColumn, TableRow } from 'types/plugins/table';
import { TableSettings } from 'types/panel/plugins';
import storage from 'utils/localStorage';
import { cloneDeep } from 'lodash';
import { setTableFilter } from './TableFilter';

interface Props {
  panelId: number
  dashboardId: string
  columns: TableColumn[]
  data: TableRow[]
  options: TableSettings
}

const storagePageKey = "tablePage"
const ComplexTable = memo((props: Props) => {
  const { data, dashboardId, panelId, options } = props


  const pageKey = storagePageKey + dashboardId + panelId
  const onShowSizeChange = (_current, pageSize) => {
    storage.set(pageKey, pageSize)
  };


  const columns = cloneDeep(props.columns)
  columns[0].fixed = "left"
  columns[0].width = "200px"
  for (const column of columns) {
    if (options.column.align != "auto") {
      column.align = options.column.align
    } else {
      if (data.length > 0) {
        const value = data[0][column.dataIndex]
        if (typeof value == "number") {
          column.align = "right"
        } else {
          column.align = "left"
        }
      }
    }

    if (options.column.enableSort) {
      column.sorter = (a, b) => a >= b ? 1 : -1
      column.sortDirections = ['descend', 'ascend']
    }

    if (options.column.enableFilter) {
      setTableFilter(column, data)
    }
  }

  return (<>
    <Table
      columns={columns}
      dataSource={data}
      size={options.cellSize}
      showHeader={options.showHeader}
      pagination={options.enablePagination ? { position:["bottomCenter"],showTotal: (total) => `Total ${total}`, total: data.length, showSizeChanger: true, defaultPageSize: storage.get(pageKey) ?? 10, pageSizeOptions: [5, 10, 20, 50, 100], onShowSizeChange: onShowSizeChange } : false}
      sticky={options.stickyHeader}
      showSorterTooltip={false}
      scroll={{ x: options.tableWidth + '%' }}
    />
  </>)
})

export default ComplexTable

