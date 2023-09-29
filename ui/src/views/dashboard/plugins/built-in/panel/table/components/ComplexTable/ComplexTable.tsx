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
import { TableColumn, TableRow } from '../../types';
import storage from 'utils/localStorage';
import { cloneDeep, isFunction, isNumber, round } from 'lodash';
import { setTableFilter } from './TableFilter';
import { Box, Button, HStack, Text, Tooltip, useColorMode, useToast } from '@chakra-ui/react';
import { findOverride, findOverrideRule, findRuleInOverride } from 'utils/dashboard/panel';
import { Panel } from 'types/dashboard';
import { TableRules } from '../../OverridesEditor';
import { formatUnit } from 'src/views/dashboard/plugins/components/UnitPicker';
import { DefaultDecimal } from 'src/data/constants';
import { commonInteractionEvent, genDynamicFunction } from 'utils/dashboard/dynamicCall';
import moment from 'moment';
import { ThresholdsConfig, ThresholdsMode } from 'types/threshold';
import { getThreshold } from 'src/views/dashboard/plugins/components/Threshold/utils';
import lodash from 'lodash'
import { useNavigate } from 'react-router-dom';
import { isEmpty } from 'utils/validate';
import BarGauge from 'src/components/BarGauge/BarGauge';
import { measureText } from 'utils/measureText';
import AutoSizer from "react-virtualized-auto-sizer";
import { paletteColorNameToHex } from 'utils/colors';
import { mapValueToText } from 'utils/valueMapping';
import { replaceWithVariables } from 'utils/variable';
import { VariableCurrentValue } from 'src/data/variable';

interface Props {
  panel: Panel
  dashboardId: string
  columns: TableColumn[]
  data: TableRow[]
}

const storagePageKey = "tablePage"
const ComplexTable = memo((props: Props) => {
  const toast = useToast()
  const navigate = useNavigate()
  const { colorMode } = useColorMode()

  const { dashboardId, panel } = props
  const data = cloneDeep(props.data)
  const options = props.panel.plugins.table

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
      column.sorter = (a, b) => {
        return a.__value__[column.dataIndex] >= b.__value__[column.dataIndex] ? 1 : -1
      }
      column.sortDirections = ['descend', 'ascend', 'descend']
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

    const thresholds: ThresholdsConfig = findRuleInOverride(override, TableRules.ColumnThreshold)
    const columnType = findRuleInOverride(override, TableRules.ColumnType)
    let max;
    let min
    if (columnType || thresholds?.mode == ThresholdsMode.Percentage) {
      const values = data.map(row => row[column.dataIndex] as number)
      max = Math.max(...values)
      min = Math.min(...values)
    }

    let bg = findRuleInOverride(override, TableRules.ColumnBg)
    bg = paletteColorNameToHex(bg, colorMode)
    let textWidth = 0;

    const colorOverride = findRuleInOverride(override, TableRules.ColumnColor)
    const mappingOverride = findRuleInOverride(override, TableRules.ColumnValueMapping)
    // modify data
    if (unit || decimal || isFunc || thresholds || columnType || panel.valueMapping.length > 0) {
      for (const row of data) {
        let color = 'inherit'
        if (colorOverride) color = colorOverride
        // raw value
        const v = row[column.dataIndex]
        // save raw value
        row['__value__'] = {
          ...row['__value__'],
          [column.dataIndex]: v
        }

        if (bg) {
          row['__bg__'] = {
            ...row['__bg__'],
            [column.dataIndex]: bg
          }
        }
        if (thresholds && isNumber(v)) {
          // seriesData, fieldName, value,min,max, lodash
          let v1 = v
          if (thresholds.enableTransform) {
            const transformFunc = genDynamicFunction(thresholds.transform); 
            if (isFunction(transformFunc)) {
              v1 = transformFunc({
                row, 
                column: column.dataIndex, 
                value: v,
                min,
                max
              }, lodash)
            }
          }

        
          const t = getThreshold(v1 as number, thresholds, max)
       
          if (t) {
            const c = paletteColorNameToHex(t.color, colorMode)
            row['__bg__'] = {
              ...row['__bg__'],
              [column.dataIndex]: c
            }
          }
        }

        let isMapped = false
        if (panel.valueMapping?.length > 0) {
          const [r, c1] = mapValueToText(v, panel.valueMapping)
          if (r) {
            row[column.dataIndex] = replaceWithVariables(r, { [VariableCurrentValue]: v })
            isMapped = true
            if (!isEmpty(c1)) {
              color = c1
            }
          }
        }

        if (mappingOverride) {
          const [r, c1] = mapValueToText(v, mappingOverride)
          if (r) {
            row[column.dataIndex] = replaceWithVariables(r, { [VariableCurrentValue]: v })
            isMapped = true
            if (!isEmpty(c1)) {
              color = c1
            }
          }

        }

        if (!isMapped) {
          if (unit) {
            row[column.dataIndex] = formatUnit(v, unit.units, decimal)
          } else if (isNumber(v)) {
            row[column.dataIndex] = round(v, decimal)
          }
        }


        if (isFunc) {
          row[column.dataIndex] = transformFunc(row[column.dataIndex], lodash, moment)
        }

        if (columnType?.type == "gauge") {
          const width = measureText(row[column.dataIndex].toString()).width
          if (width > textWidth) {
            textWidth = width
          }
        }
        color = paletteColorNameToHex(color, colorMode)
        if (color) {
          row['__color__'] = {
            ...row['__color__'] as any,
            [column.dataIndex]: color
          }
        }
      }
    }


    const ellipsis = findRuleInOverride(override, TableRules.ColumnEllipsis)
    const opacity = findRuleInOverride(override, TableRules.ColumnOpacity)
    column.render = (text, record, index) => {
      const bg = record['__bg__']?.[column.dataIndex]
      const color = record['__color__']?.[column.dataIndex]
      if (columnType?.type == "gauge") {
        return <AutoSizer>
          {({ width, height }) => {
            if (width === 0) {
              return null;
            }

            return <Box position="absolute" top="6px" left="6px" right="6px" bottom="6px"><BarGauge textSize="inherit" width={width} height={height} data={[{
              value: record['__value__']?.[column.dataIndex],
              max: max,
              min: min,
              text: text,
              color: bg,
              disableOverrideColor: true
            }]} textWidth={textWidth} threshods={thresholds} showUnfilled={true} fillOpacity={opacity ?? 0.6} mode={columnType.mode} /></Box>
          }}
        </AutoSizer>

      } else {
        return <Box padding={cellPadding} bg={bg}><Tooltip label={ellipsis ? text : null} openDelay={300}><Text color={color ?? "inherit"} wordBreak="break-all" noOfLines={ellipsis ? 1 : null}>{text}</Text></Tooltip></Box>
      }

    }

    const title = findOverrideRule(panel, column.dataIndex, TableRules.ColumnTitle)
    if (title) column.title = title

    columns.push(column)
  }


  if (options.rowActions.length > 0 && options.rowActions.some(a => !isEmpty(a.name))) {
    columns.push({
      title: isEmpty(options.actionColumnName) ? "Action" : options.actionColumnName,
      key: 'action',
      width: isEmpty(options.actionClumnWidth) ? 90 * options.rowActions.length : options.actionClumnWidth,
      render: (_, record) => (
        <HStack spacing={1}>
          {props.panel.plugins.table.rowActions.map((action, index) => {
            if (isEmpty(action.name)) {
              return
            }
            const onClick = genDynamicFunction(action.action);
            return <Button key={index + action.name} colorScheme={action.color} variant={action.style} size={options.actionButtonSize} onClick={(e) => {
              e.stopPropagation()
              if (!isFunction(onClick)) {
                toast({
                  title: "Error",
                  description: "The action function you defined is not valid",
                  status: "error",
                  duration: 4000,
                  isClosable: true,
                })
              } else {
                commonInteractionEvent(onClick, record)
              }
            }}>{action.name}</Button>
          })}
        </HStack>
      ),
    })
  }

  const onRowClick = genDynamicFunction(props.panel.plugins.table.onRowClick);

  return (<>
    <Table
      columns={columns}
      dataSource={data}
      size={options.cellSize}
      showHeader={options.showHeader}
      pagination={options.enablePagination ? { position: ["bottomCenter"], showTotal: (total) => `Total ${total}`, total: data.length, showSizeChanger: true, defaultPageSize: storage.get(pageKey) ?? 10, pageSizeOptions: [5, 10, 20, 50, 100], onShowSizeChange: onShowSizeChange } : false}
      sticky={options.stickyHeader}
      showSorterTooltip={false}
      scroll={{ x: options.tableWidth + '%' }}
      bordered={options.bordered}
      rowClassName={options.enableRowClick ? "cursor-pointer" : null}
      onRow={options.enableRowClick ? record => {
        return {
          onClick: _ => {
            if (!isFunction(onRowClick)) {
              toast({
                title: "Error",
                description: "The row click function you defined is not valid",
                status: "error",
                duration: 4000,
                isClosable: true,
              })
            } else {
              commonInteractionEvent(onRowClick, record)
            }
          }
        }
      } : null
      }
    />
  </>)
})

export default ComplexTable

