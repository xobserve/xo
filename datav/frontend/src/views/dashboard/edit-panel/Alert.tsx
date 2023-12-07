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

import { Box, StackDivider, VStack } from '@chakra-ui/react'
import { getCurrentTimeRange } from 'src/components/DatePicker/TimePicker'
import React, { useEffect, useMemo, useState } from 'react'
import { Panel } from 'types/dashboard'
import { queryAlerts } from '../grid/PanelGrid/PanelGrid'
import { filterAlerts } from '../plugins/built-in/panel/alert/Alert'

import { sortBy } from 'lodash'
import AlertRuleItem from '../plugins/built-in/panel/alert/components/AlertRuleItem'
import useBus from 'use-bus'
import { TimeChangedEvent } from 'src/data/bus-events'
import { isEmpty } from 'utils/validate'
import { getPanelRealTime } from '../store/panelRealtime'
import { $datasources } from 'src/views/datasource/store'
import { paletteMap } from 'utils/colors'
import { ColorGenerator } from 'utils/colorGenerator'
import { AlertRule } from '../plugins/built-in/panel/alert/types'

interface Props {
  panel: Panel
  onChange: any
}

const EditPanelAlert = ({ panel, onChange }: Props) => {
  const [alerts, setAlerts] = useState<AlertRule[]>(null)
  useEffect(() => {
    loadAlerts()
  }, [panel.plugins.graph.alertFilter])

  useBus(
    (e) => {
      return e.type == TimeChangedEvent
    },
    (e) => {
      setTimeout(() => {
        loadAlerts()
      }, 1000)
    },
  )

  const datasources = $datasources.get()
  const loadAlerts = async () => {
    let start
    let end
    const realTime = getPanelRealTime(panel.id)
    if (!isEmpty(realTime)) {
      start = realTime[0] * 1000
      end = realTime[1] * 1000
    } else {
      const timeRange = getCurrentTimeRange()
      start = timeRange.start.getTime()
      end = timeRange.end.getTime()
    }

    const res = await queryAlerts(
      panel,
      {
        start: new Date(start),
        end: new Date(end),
      } as any,
      panel.plugins.graph.alertFilter.datasources,
      panel.plugins.graph.alertFilter.httpQuery,
      datasources,
    )

    let rules: AlertRule[] = []
    if (res.data?.length > 0) {
      const enableFilter = panel.plugins.graph.alertFilter.enableFilter
      const stateFilter = enableFilter
        ? panel.plugins.graph.alertFilter.state
        : null

      const ruleNameFilter = enableFilter
        ? panel.plugins.graph.alertFilter.ruleName
        : ''
      const ruleLabelFilter = enableFilter
        ? panel.plugins.graph.alertFilter.ruleLabel
        : ''
      const alertLabelFilter = enableFilter
        ? panel.plugins.graph.alertFilter.alertLabel
        : ''
      const [result, _] = filterAlerts(
        res.data,
        stateFilter,
        ruleNameFilter,
        ruleLabelFilter,
        alertLabelFilter,
        [],
        '',
        false,
      )
      rules = result
    }

    const newRules = []
    for (const r of rules) {
      const a = []
      for (const alert of r.alerts) {
        const activeAt = new Date(alert.activeAt).getTime()
        if (activeAt >= start && activeAt <= end) {
          a.push(alert)
        }
      }
      r.alerts = a

      if (r.alerts.length > 0) {
        newRules.push(r)
        sortBy(r.alerts, ['activeAt']).reverse()
        r.activeAt = r.alerts.length > 0 && r.alerts[0].activeAt
      }
    }

    sortBy(newRules, ['activeAt']).reverse()
    setAlerts(newRules)
  }

  const generator = useMemo(() => {
    const palette = paletteMap[panel.styles.palette]
    return new ColorGenerator(palette)
  }, [panel.styles.palette])

  return (
    <Box>
      <VStack alignItems='left' divider={<StackDivider />} mt={2} spacing={1}>
        {alerts?.map((rule) => (
          <AlertRuleItem
            rule={rule}
            panel={panel}
            collapsed={true}
            onSelectLabel={() => {}}
            width={800}
            colorGenerator={generator}
          />
        ))}
      </VStack>
    </Box>
  )
}

export default EditPanelAlert
