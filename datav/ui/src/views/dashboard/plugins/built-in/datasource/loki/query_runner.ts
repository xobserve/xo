// Copyright 2023 xObserve.io Team

import { Panel, PanelQuery } from 'types/dashboard'
import { Datasource } from 'types/datasource'
import { TimeRange } from 'types/time'
import { replaceWithVariablesHasMultiValues } from 'utils/variable'
import { isLokiDatasourceValid } from './DatasourceEditor'
import { requestApi } from 'utils/axios/request'
import { Variable } from 'types/variable'
import { isEmpty } from 'utils/validate'
import { prometheusToPanels } from '../prometheus/transformData'
import { getNewestTimeRange } from 'src/components/DatePicker/TimePicker'
import { LokiDsQueryTypes } from './VariableEdtitor'
import { getDatasource, roundDsTime } from 'utils/datasource'
import { PanelTypeLog } from '../../panel/log/types'
import { replacePrometheusQueryWithVariables } from '../prometheus/query_runner'

export const run_loki_query = async (
  panel: Panel,
  q: PanelQuery,
  timeRange: TimeRange,
  ds: Datasource,
) => {
  if (isEmpty(q.metrics)) {
    return {
      error: null,
      data: [],
    }
  }

  const start = roundDsTime(timeRange.start.getTime() / 1000)
  const end = roundDsTime(timeRange.end.getTime() / 1000)

  const res: any = await requestApi.get(
    `/proxy/${ds.id}/loki/api/v1/query_range?query=${
      q.metrics
    }&start=${start}&end=${end}&step=${q.interval}&limit=${
      q.data['limit'] ?? 1000
    }`,
  )
  if (res.status !== 'success') {
    console.log('Failed to fetch data from loki', res.status)
    return {
      error: res.status !== undefined ? `${res.errorType}: ${res.error}` : res,
      data: [],
    }
  }

  if (res.data.result.length == 0 || res.data.result[0].values.length == 0) {
    return {
      error: null,
      data: [],
    }
  }

  let data = []
  const resultType = res.data.resultType
  if (resultType === 'matrix') {
    data = prometheusToPanels(res.data, panel, q, timeRange)
  } else if (resultType === 'streams' && panel.type == PanelTypeLog) {
    data = res.data.result
    for (let i = 0; i < data.length; i++) {
      const labels = data[i].stream
      if (labels['__error__']) {
        return {
          error: `${labels['__error__']}: ${labels['__error_details__']}`,
          data: [],
        }
      }
      const item = {
        labels: data[i].stream,
        values: data[i].values,
      }
      data[i] = item
    }
  }
  return {
    error: null,
    data: data,
  }
}

export const queryLokiSeries = async (
  dsId,
  match: string[],
  timeRange: TimeRange,
) => {
  const ds = getDatasource(dsId)
  let url
  if (timeRange) {
    const start = roundDsTime(timeRange.start.getTime() / 1000)
    const end = roundDsTime(timeRange.end.getTime() / 1000)
    url = `/proxy/${ds.id}/loki/api/v1/series?start=${start}&end=${end}`
  } else {
    url = `/proxy/${ds.id}/loki/api/v1/series?`
  }

  for (const k of match) {
    if (!isEmpty(k)) {
      url += `&match[]=${k}`
    }
  }

  const res: any = await requestApi.get(url)
  if (res.status !== 'success') {
    console.log('Failed to fetch data from loki', res.status)
    return {
      error: res.status !== undefined ? `${res.errorType}: ${res.error}` : res,
      data: [],
    }
  }

  const result = []
  for (const r of res.data) {
    let newR = '{'
    Object.keys(r).forEach((k, i) => {
      newR += `${k}="${r[k]}"${i == Object.keys(r).length - 1 ? '' : ','}`
    })
    newR += '}'
    result.push(newR)
  }

  return {
    error: null,
    data: result,
  }
}

export const queryLokiLabelNames = async (dsId, timeRange: TimeRange) => {
  const ds = getDatasource(dsId)

  let url
  if (timeRange) {
    const start = roundDsTime(timeRange.start.getTime() / 1000)
    const end = roundDsTime(timeRange.end.getTime() / 1000)
    url = `/proxy/${ds.id}/loki/api/v1/labels?start=${start}&end=${end}`
  } else {
    url = `/proxy/${ds.id}/loki/api/v1/labels?`
  }

  const res: any = await requestApi.get(url)
  if (res.status !== 'success') {
    console.log('Failed to fetch data from loki', res.status)
    return {
      error: res.status !== undefined ? `${res.errorType}: ${res.error}` : res,
      data: [],
    }
  }

  return {
    error: null,
    data: res.data,
  }
}

export const queryLokiLabelValues = async (
  dsId,
  labelName,
  timeRange: TimeRange,
) => {
  const ds = getDatasource(dsId)

  let url
  if (timeRange) {
    const start = roundDsTime(timeRange.start.getTime() / 1000)
    const end = roundDsTime(timeRange.end.getTime() / 1000)
    url = `/proxy/${ds.id}/loki/api/v1/label/${labelName}/values?start=${start}&end=${end}`
  } else {
    url = `/proxy/${ds.id}/loki/api/v1/label/${labelName}/values?`
  }

  const res: any = await requestApi.get(url)
  if (res.status !== 'success') {
    console.log('Failed to fetch data from loki', res.status)
    return {
      error: res.status !== undefined ? `${res.errorType}: ${res.error}` : res,
      data: [],
    }
  }

  return {
    error: null,
    data: res.data,
  }
}

export const queryLokiVariableValues = async (variable: Variable) => {
  let result = {
    error: null,
    data: [],
  }

  let data
  try {
    data = JSON.parse(variable.value)
  } catch (error) {
    return result
  }

  const timeRange = getNewestTimeRange()

  if (data.type == LokiDsQueryTypes.LabelValues && !isEmpty(data.labelName)) {
    const names = replaceWithVariablesHasMultiValues(data.labelName)
    const tasks = []
    for (const labelName of names) {
      tasks.push(
        queryLokiLabelValues(
          variable.datasource,
          labelName,
          data.useCurrentTime ? timeRange : null,
        ),
      )
    }
    const res0 = await Promise.all(tasks)
    for (const res of res0) {
      if (res.error) {
        result.error = res.error
      } else {
        result.data = result.data.concat(res.data)
      }
    }
  } else if (data.type == LokiDsQueryTypes.Series) {
    const res = await queryLokiSeries(
      variable.datasource,
      data.seriesSelector?.split(' ') ?? [],
      data.useCurrentTime ? timeRange : null,
    )
    if (res.error) {
      result.error = res.error
    } else {
      result.data = res.data
    }
  } else if (data.type == LokiDsQueryTypes.LabelNames) {
    const res = await queryLokiLabelNames(
      variable.datasource,
      data.useCurrentTime ? timeRange : null,
    )
    if (res.error) {
      result.error = res.error
    } else {
      result.data = res.data
    }
  }

  return result
}

export const checkAndTestLoki = async (ds: Datasource) => {
  // check datasource setting is valid
  const res = isLokiDatasourceValid(ds)
  if (res != null) {
    return res
  }

  // test connection status
  try {
    await requestApi.get(
      `/common/proxy/${ds.id}?proxy_url=${ds.url}/api/services`,
    )
    return true
  } catch (error) {
    return error.message
  }
}

export const query_loki_alerts = async (
  panel: Panel,
  timeRange: TimeRange,
  ds: Datasource,
  query: PanelQuery,
) => {
  const res: any = await requestApi.get(
    `/proxy/${ds.id}/api/v1/rules?type=alert`,
  )
  if (res.status !== 'success') {
    console.log('Failed to fetch data from prometheus', res)
    return {
      error: `${res.errorType}: ${res.error}`,
      data: [],
    }
  }

  res.data.fromDs = ds.type
  return {
    error: null,
    data: res.data,
  }
}

export const replaceLokiQueryWithVariables = (
  query: PanelQuery,
  interval: string,
) => {
  replacePrometheusQueryWithVariables(query, interval)
}
