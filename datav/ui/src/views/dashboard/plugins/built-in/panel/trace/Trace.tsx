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

import { Box, Center, HStack, useMediaQuery } from '@chakra-ui/react'
import { PanelProps } from 'types/dashboard'
import TraceSearchPanel from './components/SearchPanel'
import logfmtParser from 'logfmt/lib/logfmt_parser'
import {
  queryJaegerTrace,
  queryJaegerTraces,
} from '../../datasource/jaeger/query_runner'
import { memo, useEffect, useMemo, useState } from 'react'
import { TraceData } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'
import TraceSearchResult from './components/SearchResult'
import transformTraceData from './utils/transform-trace-data'
import { cloneDeep, toString, uniqBy } from 'lodash'
import {
  replaceWithVariables,
  replaceWithVariablesHasMultiValues,
} from 'utils/variable'
import { getNewestTimeRange } from 'src/components/DatePicker/TimePicker'
import React from 'react'
import { getDatasource } from 'utils/datasource'
import CustomScrollbar from 'src/components/CustomScrollbar/CustomScrollbar'
import { MobileBreakpoint } from 'src/data/constants'
import { isTraceData } from './utils/trace'
import { isEmpty } from 'utils/validate'
import { useStore } from '@nanostores/react'
import { $datasources } from 'src/views/datasource/store'
import { DatasourceTypeTestData } from '../../datasource/testdata/types'
import { DatasourceTypeJaeger } from '../../datasource/jaeger/types'

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

const TracePanel = (props: PanelProps) => {
  const [rawTraces, setRawTraces] = useState<TraceData[]>(null)
  const [error, setError] = useState(null)
  const datasources = useStore($datasources)
  const ds = getDatasource(props.panel.datasource.id, datasources)
  useEffect(() => {
    if (ds.type == DatasourceTypeTestData) {
      onSearch(null, null, null, null, null, null, true)
    }
  }, [ds.type, props.data])
  const onSearch = async (
    service,
    operation,
    tags,
    min,
    max,
    limit,
    useLatestTime,
  ) => {
    tags = convTagsLogfmt(tags)
    let tr = getNewestTimeRange()
    if (!useLatestTime) {
      tr = props.timeRange
    }
    switch (ds.type) {
      case DatasourceTypeJaeger:
        tags = replaceWithVariables(tags)
        min = replaceWithVariables(min)
        max = replaceWithVariables(max)
        limit = replaceWithVariables(limit)
        const services = replaceWithVariablesHasMultiValues(service)
        const operations = replaceWithVariablesHasMultiValues(operation, 'all')

        const promises = []
        for (const s of services) {
          for (const o of operations) {
            promises.push(
              queryJaegerTraces(
                props.panel.datasource.id,
                tr,
                s,
                o,
                tags,
                min,
                max,
                limit,
              ),
            )
          }
        }
        const res = await Promise.all(promises)
        const resData = []
        let err
        for (const r of res) {
          if (r.errors) {
            err = r.errors
          }
          resData.push(r.data)
        }

        setRawTraces(uniqBy(resData.filter((r) => r).flat(), (t) => t.traceID))
        setError(typeof err == 'string' ? err : JSON.stringify(err))
        break
      case DatasourceTypeTestData:
        setRawTraces(
          uniqBy(
            cloneDeep(props.data)
              .flat()
              .filter((r) => r)
              .flat(),
            (t) => t.traceID,
          ),
        )
        break
      default:
        setRawTraces([])
        break
    }
  }

  const onSearchIds = (traceIds) => {
    const ids = traceIds.split(',')
    switch (ds.type) {
      case DatasourceTypeJaeger:
        Promise.all(
          ids.map((id) => queryJaegerTrace(props.panel.datasource.id, id)),
        ).then((res) => {
          setRawTraces(res.filter((r) => r).flat())
        })
        break
      default:
        setRawTraces([])
        break
    }
  }

  const traces = useMemo(() => rawTraces?.map(transformTraceData), [rawTraces])

  const resultHeight = props.height - 7
  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
  const searchPanelWidth = isLargeScreen ? '400px' : '140px'
  return (
    <>
      {ds.type != DatasourceTypeJaeger && ds.type != DatasourceTypeTestData ? (
        <Center height='100%'>No data</Center>
      ) : (
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
              />
            </CustomScrollbar>
          </Box>
          {!error ? (
            <Box width={`calc(100% - ${searchPanelWidth})`} maxH={resultHeight}>
              <CustomScrollbar>
                {traces && (
                  <TraceSearchResult
                    traces={traces}
                    panel={props.panel}
                    dashboardId={props.dashboardId}
                    teamId={props.teamId}
                    timeRange={props.timeRange}
                    height={resultHeight}
                  />
                )}
              </CustomScrollbar>
            </Box>
          ) : (
            <Center height='100%'>{error}</Center>
          )}
        </HStack>
      )}
    </>
  )
}

export function convTagsLogfmt(tags) {
  if (!tags) {
    return ''
  }

  const data = logfmtParser.parse(tags)
  return JSON.stringify(data)
}
