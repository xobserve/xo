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
import { cloneDeep, isFunction, isNumber, round } from 'lodash';
import { setTableFilter } from './TableFilter';
import { Box, Text, Tooltip, useToast } from '@chakra-ui/react';
import { findOverride, findOverrideRule, findRuleInOverride } from 'utils/dashboard/panel';
import { Panel } from 'types/dashboard';
import { TableRules } from '../../OverridesEditor';
import { formatUnit } from 'components/Unit';
import { DefaultDecimal } from 'src/data/constants';
import { genDynamicFunction } from 'utils/dynamicCode';
import moment from 'moment';
import { ThresholdsConfig, ThresholdsMode } from 'types/threshold';
import { getThreshold } from 'components/Threshold/utils';
import lodash from 'lodash'
import { setVariable } from 'src/views/variables/Variables';
import { useNavigate } from 'react-router-dom';
import { setDateTime } from 'components/DatePicker/DatePicker';

interface Props {
  panel: Panel
  dashboardId: string
  columns: TableColumn[]
  data: TableRow[]
  options: TableSettings
}

const storagePageKey = "tablePage"
const ComplexTable = memo((props: Props) => {
  const toast = useToast()
  const navigate = useNavigate()
  const { data, dashboardId, panel, options } = props


  const pageKey = storagePageKey + dashboardId + panel.id
  const onShowSizeChange = (_current, pageSize) => {
    storage.set(pageKey, pageSize)
  };

  const cellPadding = options.cellSize == "small" ? "8px 8px" : (options.cellSize == "large" ? "16px 16px" : "12px 8px")

  const columns = []
  for (const c of props.columns) {
    const column = cloneDeep(c)
    const override = findOverride(panel, column.dataIndex)
    const dispaly = findRuleInOverride(override, TableRules.ColumnDisplay)
    if (dispaly === false) {
       continue
    }
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


    const width = findRuleInOverride(override, TableRules.ColumnWidth)
    if (width) column.width = width
    const fixed = findRuleInOverride(override, TableRules.ColumnFixed)
    if (fixed) column.fixed = fixed

    const sort = findRuleInOverride(override, TableRules.ColumnSort)
    if (options.column.enableSort || sort) {
      column.sorter = (a, b) => a >= b ? 1 : -1
      column.sortDirections = ['descend', 'ascend']
      if (sort) column.defaultSortOrder = sort
    }
    
    const filter = findRuleInOverride(override, TableRules.ColumnFilter)
    if (!filter) {
      if (options.column.enableFilter) {
        setTableFilter(column, data)
      }
    } else {
      setTableFilter(column, data, filter)
    }

    const unit = findRuleInOverride(override, TableRules.ColumnUnit)
    const decimal = findRuleInOverride(override, TableRules.ColumnDecimal) ?? DefaultDecimal
    const transform = findRuleInOverride(override, TableRules.ColumnTransform)
    let transformFunc;
    if (transform) {
      transformFunc = genDynamicFunction(transform)
    }
    const isFunc = isFunction(transformFunc)

    const thresholds:ThresholdsConfig = findRuleInOverride(override, TableRules.ColumnThreshold)
    let max;
    if (thresholds?.mode == ThresholdsMode.Percentage) {
      max = Math.max(...data.map(row => row[column.dataIndex] as number))
    }

    const bg = findRuleInOverride(override, TableRules.ColumnBg)
    // modify data
    if (unit || decimal || isFunc || thresholds) {
      for (const row of data) {
        // raw value
        const v = row[column.dataIndex]
        if (bg) {
          row['__bg__'] = {
            ...row['__bg__'],
            [column.dataIndex]: bg
          }
        }
        if (thresholds && isNumber(v)) {
          const t = getThreshold(v as number, thresholds,max)
          if (t) {
            row['__bg__'] = {
              ...row['__bg__'],
              [column.dataIndex]: t.color
            }
          }
        }

        if (isNumber(v) ) {
          if (unit) { 
            row[column.dataIndex] = formatUnit(v, unit.units, decimal)
          } else {
            row[column.dataIndex] = round(v, decimal)
          }
        }
 
        if (isFunc) {
          row[column.dataIndex] = transformFunc(row[column.dataIndex], lodash, moment)
        }
      } 
    }

  
    column.render = (text, record, index) => {
      let color = findRuleInOverride(override, TableRules.ColumnColor)
      const ellipsis = findRuleInOverride(override, TableRules.ColumnEllipsis)

      const bg = record['__bg__']?.[column.dataIndex]
      return <Box  padding={cellPadding} bg={bg}><Tooltip label={ellipsis ? text : null} openDelay={300}><Text color={color ?? "inherit"} wordBreak="break-all" noOfLines={ellipsis ? 1: null}>{text}</Text></Tooltip></Box>
    }

    const title = findOverrideRule(panel, column.dataIndex,TableRules.ColumnTitle )
    if (title) column.title = title

    columns.push(column)
  }

  const onRowClick = genDynamicFunction(props.panel.plugins.table.onRowClick);
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
      bordered={options.bordered}
      onRow= {record => {
        return { 
          onClick: _ => {
            if (!isFunction(onRowClick)) {
              toast({
                  title: "Error",
                  description: "The row click function you defined is not valid",
                  status: "error",
                  duration: 9000,
                  isClosable: true,
              })
          } else {
              onRowClick(record, navigate, (k, v) => setVariable(k, v, toast), setDateTime)
          }
          }
        } 
      }
    }
    />
  </>)
})

export default ComplexTable

