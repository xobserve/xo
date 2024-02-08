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
import { prometheusToSeriesData } from '../../../datasource/prometheus/transformData'
import { PanelGrid } from 'src/views/dashboard/grid/PanelGrid/PanelGrid'
import EditPanel from 'src/views/dashboard/edit-panel/EditPanel'
import { useSearchParam } from 'react-use'
import { UpdatePanelEvent } from 'src/data/bus-events'
import { dispatch } from 'use-bus'

const AlertStatView = (props: PanelProps) => {
  const subPanel = props.panel.plugins[props.panel.type].subPanel
  const edit = useSearchParam('editSub')
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
      subPanel,
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

  const onSubPanelChange = (p) => {
    const panel = cloneDeep(props.panel)
    panel.plugins[panel.type].subPanel = p
    dispatch({
      type: UpdatePanelEvent,
      data: panel,
    })
  }

  return (
    <>
      <PanelGrid
        dashboardId={props.dashboardId}
        panel={subPanel}
        sync={false}
        width={props.width}
        height={props.height}
        initData={[data]}
      />
      {edit && (
        <EditPanel
          dashboardId={props.dashboardId}
          initPanel={subPanel}
          onChange={onSubPanelChange}
          initPaneldata={[data]}
        />
      )}
    </>
  )
}

export default AlertStatView
