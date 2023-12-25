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

import { memo, useMemo } from 'react'
import { Panel, PanelProps } from 'types/dashboard'
import { SeriesData } from 'types/seriesData'
import { calcValueOnArray, isSeriesData } from 'utils/seriesData'
import React from 'react'
import BarGauge, { BarGaugeValue } from 'src/components/BarGauge/BarGauge'
import { findOverride, findRuleInOverride } from 'utils/dashboard/panel'
import { formatUnit } from 'src/views/dashboard/plugins/components/UnitPicker'
import { measureText } from 'utils/measureText'
import { BarGaugeRules } from './OverrideEditor'
import { isEmpty } from 'utils/validate'
import { Center } from '@chakra-ui/react'
import NoData from 'src/views/dashboard/components/PanelNoData'
import { replaceWithVariables } from 'utils/variable'
import { VariableCurrentValue } from 'src/data/variable'

interface Props extends PanelProps {
  data: SeriesData[][]
}

const BarGaugePanel = memo((props: Props) => {
  const { panel, height, width } = props
  if (isEmpty(props.data)) {
    return (
      <Center height='100%'>
        <NoData />
      </Center>
    )
  }

  if (!isSeriesData(props.data)) {
    return <Center height='100%'>Data format not support!</Center>
  }

  const rawData: SeriesData[] = useMemo(() => {
    let sd: SeriesData[] = props.data.flat()
    return sd
  }, [props.data])

  const [data, textWidth] = transformData(rawData, panel)

  const options = props.panel.plugins.barGauge
  return (
    <BarGauge
      threshods={options.thresholds}
      mode={options.mode}
      width={width}
      height={height}
      data={data}
      textWidth={textWidth}
      orientation={options.orientation}
      showUnfilled={options.style.showUnfilled}
      titleSize={options.style.titleSize}
      textSize={options.style.valueSize}
      showMax={options.showMax}
      showMin={options.showMin}
      onClick={
        panel.interactions.enableClick ? panel.interactions.onClickEvent : null
      }
    />
  )
})

export default BarGaugePanel

const transformData = (
  data: SeriesData[],
  panel: Panel,
): [BarGaugeValue[], number] => {
  const options = panel.plugins.barGauge
  const result: BarGaugeValue[] = []
  let gmax = options.max
  let gmin = options.min
  let textWidth = 0
  for (const s of data) {
    const override = findOverride(panel, s.name)
    const unitsOverride = findRuleInOverride(
      override,
      BarGaugeRules.SeriesUnits,
    )
    const nameOverride = findRuleInOverride(override, BarGaugeRules.SeriesName)
    const decimalOverride = findRuleInOverride(
      override,
      BarGaugeRules.SeriesDecimal,
    )
    const decimal = decimalOverride ?? options.value.decimal
    const units = unitsOverride?.units || options.value.units

    for (const field of s.fields) {
      if (field.type === 'number') {
        const max = Math.max(...field.values)
        const min = Math.min(...field.values)
        if (!gmax || max > gmax) gmax = max
        if (!gmin || min < gmin) gmin = min
        const value = calcValueOnArray(field.values, options.value.calc)
        const text = formatUnit(value, units, decimal)
        const width = measureText(
          text.toString(),
          options.style.valueSize,
        ).width
        if (width > textWidth) textWidth = width
        let title
        if (nameOverride?.name) {
          const v = replaceWithVariables(nameOverride.name, {
            [VariableCurrentValue]: s.name,
          })
          if (nameOverride.overrideField) {
            title = v
          } else {
            title = v + '-' + field.name
          }
        } else {
          title = s.name + '-' + field.name
        }

        result.push({
          rawTitle: s.name,
          title,
          min: min,
          max: max,
          value,
          text: text.toString(),
          units: units,
          decimal: decimal,
        })
      }
    }
  }

  for (const r of result) {
    const override = findOverride(panel, r.rawTitle)
    const rawMin = r.min
    const rawMax = r.max
    if (options.maxminFrom == 'all') {
      r.max = gmax
      r.min = gmin
    }

    if (!isEmpty(options.min)) {
      r.min = options.min
    }
    if (!isEmpty(options.max)) {
      r.max = options.max
    }

    const fromMinMaxOverride = findRuleInOverride(
      override,
      BarGaugeRules.SeriesFromMinMax,
    )
    if (!isEmpty(fromMinMaxOverride)) {
      if (fromMinMaxOverride == 'all') {
        r.max = gmax
        r.min = gmin
      } else {
        r.max = rawMax
        r.min = rawMin
      }
    }

    const overrideMin = findRuleInOverride(override, BarGaugeRules.SeriesMin)
    const overrideMax = findRuleInOverride(override, BarGaugeRules.SeriesMax)

    if (!isEmpty(overrideMin)) {
      r.min = overrideMin
    }
    if (!isEmpty(overrideMax)) {
      r.max = overrideMax
    }

    const overredThresholds = findRuleInOverride(
      override,
      BarGaugeRules.SeriesThresholds,
    )
    r.thresholds = overredThresholds
  }

  return [result, textWidth]
}
