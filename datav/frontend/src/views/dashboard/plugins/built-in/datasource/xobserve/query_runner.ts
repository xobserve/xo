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

import { Datasource } from 'types/datasource'
import { Variable } from 'types/variable'
import { Panel, PanelQuery } from 'types/dashboard'
import { TimeRange } from 'types/time'
import { concat, isObject } from 'lodash'
import _ from 'lodash'
import { getNewestTimeRange } from 'src/components/DatePicker/TimePicker'
import { isJSON } from 'utils/is'
import { requestApi } from 'utils/axios/request'
import { isEmpty } from 'utils/validate'
import { roundDsTime } from 'utils/datasource'
import { $variables } from 'src/views/variables/store'
import { QueryPluginResult } from 'types/plugin'
import {
  queryPluginDataToLogs,
  queryPluginDataToNodeGraph,
  queryPluginDataToTable,
  queryPluginDataToTimeSeries,
  queryPluginDataToValueList,
} from 'utils/plugins'
import { DataFormat } from 'types/format'
import { $xobserveQueryParams } from './store'
import { parseVariableFormat } from 'utils/format'
import { VariableSplitChar } from 'src/data/variable'
import { queryPluginDataToTrace, queryPluginDataToTraceChart } from './utils'
import { $datasources } from 'src/views/datasource/store'
import { $dashboard } from 'src/views/dashboard/store/dashboard'

export const runQuery = async (
  panel: Panel,
  q: PanelQuery,
  range: TimeRange,
  ds: Datasource,
  extraParams?: Record<string, any>,
) => {
  if (isEmpty(q.metrics)) {
    return {
      error: null,
      data: [],
    }
  }

  const start = roundDsTime(range.start.getTime() / 1000)
  const end = roundDsTime(range.end.getTime() / 1000)

  const dash = $dashboard.get()
  // clickhouse data has writing lacency, so we need to fetch data from 2 seconds before
  let url = `/xoProxy/${ds.teamId}/${ds.id}/${dash ? dash.id : "null"}?query=${q.metrics}&params=${
    q.data[q.metrics]?.params ?? '{}'
  }&start=${start}&end=${end - 5}&step=${q.interval}`
  if (!isEmpty(extraParams)) {
    Object.entries(extraParams).forEach((v) => {
      if (!isEmpty(v[1])) {
        url += `&${v[0]}=${v[1]}`
      }
    })
  }

  const queryParams = $xobserveQueryParams.get()
  if (!isEmpty(queryParams)) {
    Object.entries(queryParams).forEach((v) => {
      url += `&${v[0]}=${v[1]}`
    })
  }

  const res: {
    status: string
    error: string
    data: QueryPluginResult
  } = await requestApi.get(url)

  if (res.status !== 'success') {
    console.log('Failed to fetch data from target datasource', res)
    return {
      error: res.error,
      data: [],
    }
  }

  if (res.data && res.data.status != 'success') {
    return {
      error: res.data.error,
      data: [],
    }
  }

  let data
  switch (q.data['format']) {
    case DataFormat.TimeSeries:
      data = queryPluginDataToTimeSeries(res.data.data, q)
      break
    case DataFormat.Table:
      if (res.data.data.columns) {
        data = queryPluginDataToTable(res.data.data, q)
      } else {
        if (isObject(res.data.data)) {
          Object.values(res.data.data).forEach((v: any) => {
            if (v.columns) {
              data = queryPluginDataToTable(v, q)
            }
          })
        }
      }

      break
    case DataFormat.Logs:
      data = queryPluginDataToLogs(res.data.data as any, q)
      break
    case DataFormat.NodeGraph:
      data = queryPluginDataToNodeGraph(res.data.data as any, q)
      break
    case DataFormat.Traces:
      data = res.data.data
      data.chart = data.chart && queryPluginDataToTraceChart(data.chart)
      break
    case DataFormat.Trace:
      data = queryPluginDataToTrace(res.data.data as any, q)
      break
    case DataFormat.ValueList:
      data = queryPluginDataToValueList(res.data.data as any, q)
      break
    default:
      data = res.data.data
  }

  return {
    error: null,
    data,
  }
}

export const checkAndTestDatasource = async (ds: Datasource) => {
  // check datasource setting is valid
  const res: QueryPluginResult = await requestApi.get(
    `/datasource/test?type=${ds.type}&url=${ds.url}&database=${ds.data.database}&username=${ds.data.username}&password=${ds.data.password}`,
  )
  return res.status == 'success' ? true : res.error
}

export const queryxobserveVariableValues = async (
  variable: Variable,
  useCurrentTimerange = true,
) => {
  let result = {
    error: null,
    data: null,
  }
  const data = isJSON(variable.value) ? JSON.parse(variable.value) : null
  if (!data || isEmpty(data.url)) {
    return result
  }

  const ds = $datasources.get().find((ds) => ds.id == variable.datasource)
  if (!ds) {
    console.error('datasource not found:', variable.datasource)
    return result
  }

  const timeRange = getNewestTimeRange()

  const query: PanelQuery = {
    id: 65,
    metrics: data.url,
    data: {
      [data.url]: {
        params: replacexobserveQueryWithVariables(data.params, null),
      },
    },
  }

  const res = await runQuery(null, query, timeRange, ds, {})
  if (res.error) {
    result.error = res.error
    return result
  }

  const res1 = queryPluginDataToValueList(res.data, query)
  result.data = res1

  return result
}

export const replacexobserveQueryWithVariables = (
  query: PanelQuery | string,
  interval: string,
  pvariables?: Variable[],
) => {
  const vars = concat(pvariables ?? [], $variables.get()) 
  if (!query) {
    return query
  }
  if (typeof query == 'string') {
    let q: string = query
    const formats = parseVariableFormat(q)
    for (const f of formats) {
      const v = vars.find((v) => v.name == f)
      if (v) {
        q = q.replaceAll(
          `\${${f}}`,
          v.selected?.replaceAll(VariableSplitChar, '|'),
        )
      }
    }

    return q
  }

  const formats = parseVariableFormat(query.metrics)
  for (const f of formats) {
    const v = vars.find((v) => v.name == f)
    if (v) {
      query.metrics = query.metrics.replaceAll(
        `\${${f}}`,
        v.selected?.replaceAll(VariableSplitChar, '|'),
      )
    }
  }
}

export const query_http_alerts = async (
  panel: Panel,
  timeRange: TimeRange,
  ds: Datasource,
  query: PanelQuery,
) => {
  // const res = await run_http_query(panel, query, timeRange, ds)
  // res.data.fromDs = ds.type
  // return res
  return []
}
