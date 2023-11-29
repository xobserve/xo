// Copyright 2023 xObserve.io Team
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

import React, { useMemo } from 'react'
import { Box, Center, HStack, Text, useMediaQuery } from '@chakra-ui/react'
import { PanelProps } from 'types/dashboard'
import { memo, useEffect, useState } from 'react'
import { Trace } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'

import { cloneDeep, set } from 'lodash'
import { getNewestTimeRange } from 'src/components/DatePicker/TimePicker'
import { getDatasource } from 'utils/datasource'
import CustomScrollbar from 'src/components/CustomScrollbar/CustomScrollbar'
import {
  DatasourceMaxDataPoints,
  DatasourceMinInterval,
  MobileBreakpoint,
} from 'src/data/constants'
import { isEmpty } from 'utils/validate'
import { useStore } from '@nanostores/react'
import { $datasources } from 'src/views/datasource/store'
import { DatasourceTypeTestData } from '../../datasource/testdata/types'
import { builtinDatasourcePlugins } from '../../plugins'
import { externalDatasourcePlugins } from '../../../external/plugins'
import { calculateInterval } from 'utils/datetime/range'
import { DatasourceTypexobserve } from '../../datasource/xobserve/types'
import { durationToMilliseconds } from 'utils/date'
import { convTagsLogfmt } from '../trace/Trace'
import { QueryPluginData } from 'types/plugin'
import { PanelType } from './types'
import TraceSearchResult from '../trace/components/SearchResult'
import { isTraceData } from '../trace/utils/trace'
import TraceSearchPanel from '../trace/components/SearchPanel'

const TracePanelWrapper = memo((props: PanelProps) => {
  // const ds = getDatasource(props.panel.datasource.id)

  const d = props.data?.flat()
  if (!isEmpty(d) && !isTraceData(d)) {
    return <Center height='100%'>Data format not supported!</Center>
  }

  return (
    <>
      {
        // (ds.type != DatasourceType.Jaeger && ds.type != DatasourceType.TestData)
        //     ?
        //     <Center height="100%">Trace panel only support Jaeger and Testdata datasource</Center>
        //     :
        <TracePanel {...props} />
      }
    </>
  )
})
export default TracePanelWrapper

export interface TraceTagKey {
  name: string
  type: string // "attributes" or "resources"
  dataType: string // string, bool or float64
  isColumn: boolean
}

const TracePanel = (props: PanelProps) => {
  const { panel } = props
  const [traces, setTraces] = useState<Trace[]>(null)
  const [traceChart, setTraceChart] = useState<QueryPluginData>(null)
  const [traceTagKeys, setTraceTagKeys] = useState<TraceTagKey[]>([])
  const [error, setError] = useState<string>(null)
  const datasources = useStore($datasources)
  const ds = getDatasource(props.panel.datasource.id, datasources)
  const dsPlugin =
    builtinDatasourcePlugins[ds.type] ?? externalDatasourcePlugins[ds.type]
  useEffect(() => {
    if (ds.type == DatasourceTypeTestData) {
      onSearch(null, null, null, null, null, null, true, null)
    }
  }, [ds.type, props.data])

  useEffect(() => {
    if (dsPlugin) {
      loadTagKeys()
    }
  }, [dsPlugin])

  const loadTagKeys = async () => {
    const res = await dsPlugin.runQuery(
      panel,
      {
        id: 65,
        metrics: 'getTraceTagKeys',
        data: {},
      },
      props.timeRange,
      ds,
      {},
    )
    setTraceTagKeys(res.data)
  }

  const onSearch = async (
    service,
    operation,
    tags,
    min,
    max,
    limit,
    useLatestTime,
    [[aggregate, groupby], onlyChart],
  ) => {
    tags = convTagsLogfmt(tags)
    let tr = getNewestTimeRange()
    if (!useLatestTime) {
      tr = props.timeRange
    }
    switch (ds.type) {
      case DatasourceTypexobserve:
        tags = dsPlugin.replaceQueryWithVariables(tags)
        min = !isEmpty(min)
          ? durationToMilliseconds(dsPlugin.replaceQueryWithVariables(min))
          : min
        max = durationToMilliseconds(dsPlugin.replaceQueryWithVariables(max))
        const services = dsPlugin.replaceQueryWithVariables(service)
        const operations = dsPlugin.replaceQueryWithVariables(operation)

        const query = cloneDeep(panel.datasource.queries[0])
        const intervalObj = calculateInterval(
          props.timeRange,
          panel.datasource.queryOptions.maxDataPoints ??
            DatasourceMaxDataPoints,
          isEmpty(panel.datasource.queryOptions.minInterval)
            ? DatasourceMinInterval
            : panel.datasource.queryOptions.minInterval,
        )
        query.interval = intervalObj.intervalMs / 1000

        const res = await dsPlugin.runQuery(panel, query, props.timeRange, ds, {
          tags,
          min,
          max,
          limit,
          service: services,
          operation: operations,
          aggregate,
          groupby,
          onlyChart,
        })
        if (res.error) {
          setError(res.error)
          setTraces(null)
          setTraceChart(null)
          return
        } else {
          setError(null)
        }
        if (!onlyChart && res.data.traces) {
          setTraces(transformTraces(res.data.traces))
        } else {
          setTraces([])
        }

        setTraceChart(res.data.chart)
        break
      case DatasourceTypeTestData:
        setTraces(props.data)
        break
      default:
        setTraces([])
        break
    }
  }

  const onSearchIds = async (traceIds) => {
    const query = cloneDeep(panel.datasource.queries[0])

    const res = await dsPlugin.runQuery(panel, query, props.timeRange, ds, {
      traceIds,
    })
    setTraces(transformTraces(res.data.traces))
    setTraceChart(null)
  }

  const resultHeight = props.height - 7
  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
  const searchPanelWidth = isLargeScreen ? '300px' : '140px'

  const groupByOptions = useMemo(() => {
    const groupByOptions = [
      { label: 'None', value: '' },
      { label: 'operationName', value: 'name' },
      { label: 'serviceName', value: 'serviceName' },
    ]
    for (const tagKey of traceTagKeys) {
      if (
        tagKey.name != 'serviceName' &&
        tagKey.name != 'name' &&
        tagKey.isColumn
      ) {
        groupByOptions.push({ label: tagKey.name, value: tagKey.name })
      }
    }
    return groupByOptions
  }, [traceTagKeys])

  return (
    <>
      {
        <HStack alignItems='top' px='2' py='1' spacing={isLargeScreen ? 6 : 2}>
          <Box
            width={searchPanelWidth}
            pt='2'
            pl='1'
            maxH={props.height}
            px={isLargeScreen ? 4 : 0}
          >
            <CustomScrollbar>
              <TraceSearchPanel
                timeRange={props.timeRange}
                dashboardId={props.dashboardId}
                panel={props.panel}
                onSearch={onSearch}
                onSearchIds={onSearchIds}
                traceTagKeys={traceTagKeys}
              />
            </CustomScrollbar>
          </Box>
          <Box width={`calc(100% - ${searchPanelWidth})`} maxH={resultHeight}>
            <CustomScrollbar>
              {traces && panel.plugins[PanelType].chart && (
                <TraceSearchResult
                  traces={traces}
                  panel={props.panel}
                  dashboardId={props.dashboardId}
                  teamId={props.teamId}
                  timeRange={props.timeRange}
                  height={resultHeight}
                  traceChart={traceChart}
                  traceChartOptions={panel.plugins[PanelType].chart}
                  groupByOptions={groupByOptions}
                />
              )}
              {error && <Text>{error}</Text>}
            </CustomScrollbar>
          </Box>
        </HStack>
      }
    </>
  )
}

const transformTraces = (traces: any[]): Trace[] => {
  for (const trace of traces) {
    const services = []
    const errorServices = new Set<string>()
    let errorsCount = 0
    for (const service of trace.services) {
      services.push({ name: service.name, numberOfSpans: service.numSpans })
      if (service.errors > 0) {
        errorServices.add(service.name)
        errorsCount += service.errors
      }
    }

    trace.services = services
    trace.errorServices = errorServices
    trace.errorsCount = errorsCount
  }

  return traces
}
