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

import { cloneDeep, round } from 'lodash'
import React, { useMemo } from 'react'
import { Panel, PanelProps } from 'types/dashboard'
import StatPanel from '../../stat/Stat'
import { SeriesData } from 'types/seriesData'
import { AlertRule } from '../types'
import { ValueCalculationType } from 'types/value'
import { VarialbeAllOption } from 'src/data/variable'
import { prometheusToSeriesData } from '../../../datasource/prometheus/transformData'
import { builtinPanelPlugins } from '../../../plugins'
import { PanelTypeStat } from '../../stat/types'
import { initPanel } from 'src/data/panel/initPanel'
import { PanelGrid } from 'src/views/dashboard/grid/PanelGrid/PanelGrid'

const AlertStatView = (props: PanelProps) => {
  const panel: Panel = initPanel(props.panel.id * 10 + 1)
  panel.type = PanelTypeStat
  const plugin = builtinPanelPlugins[panel.type]
  panel.plugins = {
    [panel.type]: plugin.settings.initOptions ?? {},
  }
  panel.title = ''
  const data: SeriesData[] = useMemo(() => {
    const promFormatData = {
      resultType: 'matrix',
      result: [
        {
          metric: { __name__: 'alert' },
          values: [],
        },
      ],
    }

    const timeMap = new Map()
    for (const rule0 of props.data) {
      const rule: AlertRule = rule0

      for (const alert of rule.alerts) {
        const ts = round(new Date(alert.activeAt).getTime() / 1000)
        const t = timeMap.get(ts) ?? 0
        timeMap.set(ts, t + 1)
      }
    }

    const timeline = Array.from(timeMap.keys()).sort()
    for (const ts of timeline) {
      promFormatData.result[0].values.push([ts, timeMap.get(ts)])
    }

    const data: SeriesData[] = prometheusToSeriesData(
      panel,
      promFormatData,
      {
        id: 65,
        legend: '',
        interval: null,
      } as any,
      props.timeRange,
      true,
    )
    data[0].name = props.panel.plugins.alert.stat.statName
    return data
  }, [props.data])

  // const newProps = cloneDeep(props)
  // const statPlugin = builtinPanelPlugins.stat
  // const statOptions = statPlugin.settings.initOptions
  // statOptions.value.calc = ValueCalculationType.Sum
  // statOptions.value.decimal = 0
  // statOptions.displaySeries = VarialbeAllOption
  // statOptions.showGraph = props.panel.plugins.alert.stat.showGraph
  // statOptions.styles.connectNulls = true
  // statOptions.styles.showPoints = true
  // statOptions.styles.layout = props.panel.plugins.alert.stat.layout
  // statOptions.styles.colorMode = props.panel.plugins.alert.stat.colorMode
  // statOptions.styles.style = props.panel.plugins.alert.stat.style
  // statOptions.textSize.value = props.panel.plugins.alert.stat.valueSize
  // statOptions.textSize.legend = props.panel.plugins.alert.stat.legendSize
  // statOptions.showLegend = true
  // newProps.panel.plugins.stat = statOptions

  // newProps.panel.type = PanelTypeStat
  panel.overrides = [
    {
      target: props.panel.plugins.alert.stat.statName,
      overrides: [
        {
          type: 'Series.thresholds',
          value: {
            mode: 'absolute',
            thresholds: [
              {
                color: props.panel.plugins.alert.stat.color,
                value: null,
              },
            ],
          },
        },
      ],
    },
  ]

  console.log('here333333:', data)
  return (
    <PanelGrid
      dashboardId={props.dashboardId}
      panel={panel}
      sync={false}
      width={props.width}
      height={props.height}
      initData={[data]}
    />
  )
}

export default AlertStatView
