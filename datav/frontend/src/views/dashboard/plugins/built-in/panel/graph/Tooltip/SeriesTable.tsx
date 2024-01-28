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
import React from 'react'
import {
  Box,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
  useMediaQuery,
} from '@chakra-ui/react'
import { formatUnit } from 'src/views/dashboard/plugins/components/UnitPicker'
import { orderBy, round } from 'lodash'
import { memo } from 'react'
import { OverrideItem, PanelProps } from 'types/dashboard'
import { ValueSetting } from 'types/panel/plugins'
import { FieldType, SeriesData } from 'types/seriesData'
import { findOverride, findRuleInOverride } from 'utils/dashboard/panel'
import { GraphRules } from '../OverridesEditor'
import { StatRules } from '../../stat/OverridesEditor'
import { MobileVerticalBreakpoint } from 'src/data/constants'
import { PanelTypeGraph } from '../types'

interface Props {
  props: PanelProps
  data: SeriesData[]
  nearestSeries?: SeriesData
  filterIdx?: number
  panelType: string
  width?: number
  inactiveSeries?: string[]
}

const SeriesTable = memo(
  ({
    props,
    data,
    nearestSeries,
    filterIdx,
    panelType,
    width,
    inactiveSeries,
  }: Props) => {
    const valueSettings: ValueSetting = props.panel.plugins[panelType].value

    const tooltipMode = props.panel.plugins[panelType].tooltip.mode ?? 'single'
    const tooltipSort = props.panel.plugins[panelType].tooltip.sortBy ?? 'value'
    const tooltipSortDir =
      props.panel.plugins[panelType].tooltip.sortDir ?? 'desc'

    const res = []

    if (tooltipMode != 'single') {
      for (const d of data) {
        res.push({
          name: d.name,
          value: [
            [
              '',
              d.fields.find((f) => f.type == FieldType.Number).values[
                filterIdx
              ],
            ],
          ],
          color: d.color,
          rawName: d.rawName,
        })
      }
    } else {
      res.push({
        name: nearestSeries.name,
        color: nearestSeries.color,
        value: [
          [
            '',
            nearestSeries.fields.find((f) => f.type != FieldType.Time).values[
              filterIdx
            ],
          ],
        ],
        rawName: nearestSeries.rawName,
      })
    }

    const values = orderBy(
      res,
      (i) => {
        if (tooltipSort == 'name') {
          return i.name
        }
        const v = i.value[0][1]
        return v == null ? 0 : v
      },
      tooltipSortDir,
    )

    for (const v of values) {
      const override: OverrideItem = findOverride(props.panel, v.rawName)
      const unitsOverride = findRuleInOverride(
        override,
        panelType == PanelTypeGraph
          ? GraphRules.SeriesUnit
          : StatRules.SeriesUnit,
      )
      let units = valueSettings.units
      let unitsType = valueSettings.unitsType
      let decimal = valueSettings.decimal
      if (unitsOverride) {
        units = unitsOverride.units
        unitsType = unitsOverride.unitsType
      }
      const decimalOverride = findRuleInOverride(
        override,
        panelType == PanelTypeGraph
          ? GraphRules.SeriesDecimal
          : StatRules.SeriesDecimal,
      )
      if (decimalOverride) {
        decimal = decimalOverride
      }

      v.units = units
      v.unitsType = unitsType
      v.decimal = decimal
    }

    const [isMobileScreen] = useMediaQuery(MobileVerticalBreakpoint)
    return (
      <Box width='100%'>
        <TableContainer
          maxW={width}
          p={0}
          marginLeft='-18px'
          sx={{
            '::-webkit-scrollbar': {
              width: '1px',
              height: '1px',
            },
          }}
        >
          <Table variant='unstyled' size='sm' p='0'>
            <Tbody>
              {values.map((v, i) => {
                if (inactiveSeries.includes(v.name)) {
                  // hiding inactive tooltips
                  return <></>
                }
                return (
                  <Tr verticalAlign='top'>
                    <Td fontSize='0.8rem' py='1'>
                      <HStack
                        alignItems='start'
                        opacity={v.name == nearestSeries?.name ? 1 : 0.8}
                        fontWeight={
                          v.name == nearestSeries?.name ? 'bold' : 'inherit'
                        }
                        userSelect='none'
                      >
                        <Box
                          width='8px'
                          minWidth='8px'
                          height='4px'
                          background={v.color}
                          mt='6.5px'
                        ></Box>
                        <Text
                          noOfLines={3}
                          minWidth='fit-content'
                          wordBreak='break-all'
                          whiteSpace={'break-spaces'}
                          maxW={isMobileScreen ? props.width / 3 : null}
                        >
                          {v.name}
                        </Text>
                      </HStack>
                    </Td>
                    {v.value.map((v0, i) => (
                      <Td textAlign='right' fontSize='0.8rem' py='1' px='1'>
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

export default SeriesTable
