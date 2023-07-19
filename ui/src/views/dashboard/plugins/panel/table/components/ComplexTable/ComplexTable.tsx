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
import { cloneDeep, isNumber, round } from 'lodash';
import { setTableFilter } from './TableFilter';
import { Text } from '@chakra-ui/react';
import { findOverride, findOverrideRule, findRuleInOverride } from 'utils/dashboard/panel';
import { Panel } from 'types/dashboard';
import { TableRules } from '../../OverridesEditor';
import { formatUnit } from 'components/Unit';
import { DefaultDecimal } from 'src/data/constants';

interface Props {
  panel: Panel
  dashboardId: string
  columns: TableColumn[]
  data: TableRow[]
  options: TableSettings
}

const storagePageKey = "tablePage"
const ComplexTable = memo((props: Props) => {
  const { data, dashboardId, panel, options } = props


  const pageKey = storagePageKey + dashboardId + panel.id
  const onShowSizeChange = (_current, pageSize) => {
    storage.set(pageKey, pageSize)
  };

  const cellPadding = options.cellSize == "small" ? "8px 8px" : (options.cellSize == "large" ? "16px 16px" : "12px 8px")
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
    
    const override = findOverride(panel, column.dataIndex)
    column.render = (text, record, index) => {
      const color = findRuleInOverride(override, TableRules.ColumnColor)
      const bg = findRuleInOverride(override, TableRules.ColumnBg)
      const unit = findRuleInOverride(override, TableRules.ColumnUnit)
      const decimal = findRuleInOverride(override, TableRules.ColumnDecimal) ?? DefaultDecimal
      if (isNumber(text) ) {
        if (unit) { 
          text = formatUnit(text, unit.units, decimal)
        } else {
          text = round(text, decimal)
        }
      }

      return <Text color={color ?? "inherit"} padding={cellPadding} bg={bg}>{text}</Text>
    }

    const title = findOverrideRule(panel, column.dataIndex,TableRules.ColumnTitle )
    if (title) column.title = title
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

