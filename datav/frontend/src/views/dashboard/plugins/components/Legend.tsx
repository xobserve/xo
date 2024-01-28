// Copyright 2023 xobserve.io Team
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

// Render series table in tooltip
import React, { useEffect, useState } from 'react'
import {
  Box,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { formatUnit } from 'src/views/dashboard/plugins/components/UnitPicker'
import { cloneDeep, orderBy, round } from 'lodash'
import { memo } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { useKeyPress } from 'react-use'
import { UpdatePanelEvent } from 'src/data/bus-events'
import { OverrideItem, Panel } from 'types/dashboard'
import { ValueSetting } from 'types/panel/plugins'
import { FieldType, SeriesData } from 'types/seriesData'
import { dispatch } from 'use-bus'

import { calcValueOnArray } from 'utils/seriesData'
import { findOverride, findRuleInOverride } from 'utils/dashboard/panel'
import { BarRules } from '../built-in/panel/bar/OverridesEditor'
import { PanelInactiveKey } from 'src/data/storage-keys'
import storage from 'utils/localStorage'
import CopyToClipboard from 'components/CopyToClipboard'

interface Props {
  dashboardId: string
  panelWidth: number
  panel: Panel
  options: {
    value: ValueSetting
    legend: any
  }
  data: SeriesData[]
  placement?: 'bottom' | 'right'
  width?: number
  inactiveSeries: string[]
  onSeriesActive: any
}

const LegendTable = memo(
  ({
    dashboardId,
    panelWidth,
    options,
    panel,
    data,
    width,
    onSeriesActive,
    inactiveSeries,
  }: Props) => {
    const inactiveKey = PanelInactiveKey + dashboardId + '-' + panel.id
    useEffect(() => {
      if (inactiveSeries.length > 0) {
        storage.set(inactiveKey, inactiveSeries)
      } else {
        storage.remove(inactiveKey)
      }
    }, [inactiveSeries])

    const pressShift = useKeyPress((event) => {
      if (event.key === 'Shift') {
        event.stopPropagation()
        event.preventDefault()
        return true
      }
      return false
    })

    const valueSettings: ValueSetting = options.value
    const res = []

    for (const d of data) {
      let v = []
      for (const calc of options.legend.valueCalcs) {
        v.push([
          calc,
          calcValueOnArray(
            d.fields.find((f) => f.type == FieldType.Number).values,
            calc,
          ),
        ])
      }
      res.push({ name: d.name, value: v, color: d.color, rawName: d.rawName })
    }

    const values = orderBy(
      res,
      (i) => {
        for (const v of i.value) {
          if (v[0] == options.legend.order.by) {
            return v[1] == null ? 0 : v[1]
          }
        }
      },
      options.legend.order.sort,
    )

    for (const v of values) {
      const override: OverrideItem = findOverride(panel, v.rawName)
      const unitsOverride = findRuleInOverride(override, BarRules.SeriesUnit)
      let units = valueSettings.units
      let unitsType = valueSettings.unitsType
      let decimal = valueSettings.decimal
      if (unitsOverride) {
        units = unitsOverride.units
        unitsType = unitsOverride.unitsType
      }
      const decimalOverride = findRuleInOverride(
        override,
        BarRules.SeriesDecimal,
      )
      if (decimalOverride) {
        decimal = decimalOverride
      }

      v.units = units
      v.unitsType = unitsType
      v.decimal = decimal
    }

    const onSelectSeries = (s, i, pressShift) => {
      if (!pressShift) {
        // 未按住 shift
        if (inactiveSeries.length == 0) {
          // 也没有隐藏的 series: 只显示 s, 隐藏其它
          const inactive = []
          for (const s1 of data) {
            if (s1.name != s) {
              inactive.push(s1.name)
            }
          }
          onSeriesActive(inactive)
        } else {
          // 已经有 series 被隐藏
          if (inactiveSeries.includes(s)) {
            //  s 处于隐藏状态，点击它，显示它，并隐藏其它
            const inactive = []
            for (const s1 of data) {
              if (s1.name != s) {
                inactive.push(s1.name)
              }
            }
            onSeriesActive(inactive)
          } else {
            // s 目前处于显示状态，再次点击它，显示所有
            onSeriesActive([])
          }
        }
      } else {
        // 按住 shift
        if (inactiveSeries.length == 0) {
          // 没有处于隐藏的, 显示 s
          const inactive = []
          for (const s1 of data) {
            if (s1.name != s) {
              inactive.push(s1.name)
            }
          }
          onSeriesActive(inactive)
          return
        }
        if (inactiveSeries.includes(s)) {
          // s 处于隐藏状态，点击它，显示它
          const inactive = inactiveSeries.filter((s1) => s1 != s)
          onSeriesActive(inactive)
        } else {
          // s 处于显示状态，点击它，隐藏它
          const inactive = [...inactiveSeries]
          inactive.push(s)
          onSeriesActive(inactive)
        }
      }
    }

    const showValuesName = options.legend.showValuesName ?? true
    return (
      <Box width='100%'>
        <TableContainer
          maxW={options.legend.placement == 'bottom' ? panelWidth : width}
          p={0}
          marginLeft='-18px'
          overflowX='hidden'
          sx={{
            '::-webkit-scrollbar': {
              width: '1px',
              height: '1px',
            },
          }}
        >
          <Table variant='unstyled' size='sm' p='0'>
            <Thead>
              <Tr>
                <Th> </Th>
                {values[0].value.map((v) => (
                  <Td
                    width='55px'
                    pt='-2px'
                    pb='1'
                    pr='1'
                    pl='0'
                    textAlign='center'
                    fontWeight='450'
                    onClick={() => {
                      options.legend.order = {
                        by: v[0],
                        sort:
                          options.legend.order.sort == 'asc' ? 'desc' : 'asc',
                      }
                      dispatch({
                        type: UpdatePanelEvent,
                        data: cloneDeep(panel),
                      })
                    }}
                  >
                    {showValuesName && (
                      <HStack
                        spacing={0}
                        justifyContent='end'
                        cursor='pointer'
                        position='relative'
                      >
                        <Text fontSize='0.9em !important' lineHeight='13px'>
                          {v[0]}
                        </Text>
                        <Text>
                          {' '}
                          {options.legend.order.by == v[0] && (
                            <Text
                              fontSize='0.6em'
                              opacity='0.7'
                              position='absolute'
                              top='3.5px'
                            >
                              {options.legend.order.sort == 'asc' ? (
                                <FaChevronUp />
                              ) : (
                                <FaChevronDown />
                              )}
                            </Text>
                          )}
                        </Text>
                      </HStack>
                    )}
                  </Td>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {values.map((v, i) => {
                return (
                  <Tr verticalAlign='top' width='100%'>
                    <Td
                      fontSize='0.8em'
                      py='1'
                      cursor='pointer'
                      onClick={() => onSelectSeries(v.name, i, pressShift[0])}
                      userSelect='none'
                    >
                      <HStack
                        alignItems='start'
                        opacity={inactiveSeries.includes(v.name) ? '0.6' : 1}
                      >
                        <Box
                          width='10px'
                          minWidth='10px'
                          height='4px'
                          background={v.color}
                          mt='6.5px'
                        ></Box>

                        {options.legend.placement == 'bottom' ? (
                          <Text
                            noOfLines={3}
                            minWidth='fit-content'
                            wordBreak='break-all'
                            whiteSpace={'break-spaces'}
                          >
                            <CopableText text={v.name} />
                          </Text>
                        ) : (
                          <Text
                            w={
                              options.legend.nameWidth === 'full'
                                ? '100%'
                                : options.legend.nameWidth + 'px'
                            }
                            noOfLines={3}
                            wordBreak='break-all'
                            whiteSpace={
                              options.legend.nameWidth === 'full'
                                ? 'nowrap'
                                : 'break-spaces'
                            }
                          >
                            <CopableText text={v.name} />
                          </Text>
                        )}
                      </HStack>
                    </Td>
                    {v.value.map((v0, i) => (
                      <Td textAlign='right' fontSize='0.75em' py='1' px='1'>
                        {v0[1]
                          ? v.unitsType != 'none'
                            ? formatUnit(v0[1], v.units, v.decimal)
                            : round(v0[1], v.decimal)
                          : v0[1]}
                      </Td>
                    ))}
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    )
  },
)

export default LegendTable

const CopableText = ({ text }) => {
  const [onHover, setOnHover] = useState(false)
  return (
    <span
      onMouseEnter={() => setOnHover(true)}
      onMouseLeave={() => setOnHover(false)}
    >
      <span>{text}</span>
      {onHover && (
        <span
          style={{
            position: 'absolute',
            paddingTop: '1px',
            paddingLeft: '2px',
          }}
        >
          <CopyToClipboard
            copyText={text}
            tooltipTitle='Copy name'
            fontSize='0.8rem'
          />
        </span>
      )}
    </span>
  )
}
