// Copyright 2023 Datav.io Team
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


import { isEmpty, round } from "lodash"
import { Panel, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"
import { prometheusToPanels } from "./transformData"
import { Datasource } from "types/datasource"
import { isPromethesDatasourceValid } from "./DatasourceEditor"
import { Variable } from "types/variable"
import { isJSON } from "utils/is"
import { getNewestTimeRange } from "components/DatePicker/TimePicker"

import { PromDsQueryTypes } from "./VariableEditor"
import { parseVariableFormat } from "utils/format"
import { variables } from "src/views/dashboard/Dashboard"
import { VariableSplitChar, VarialbeAllOption } from "src/data/variable"
import { requestApi } from "utils/axios/request"
import { replaceWithVariablesHasMultiValues } from "utils/variable"

export const run_prometheus_query = async (panel: Panel, q: PanelQuery, range: TimeRange, ds: Datasource) => {
    if (isEmpty(q.metrics)) {
        return {
            error: null,
            data: []
        }
    }

    const start = round(range.start.getTime() / 1000)
    const end = range.end.getTime() / 1000

    //@todo: 
    // 1. rather than query directyly to prometheus, we should query to our own backend servie
    // 2. using `axios` instead of `fetch`

    const res: any = await requestApi.get(`/proxy/${ds.id}/api/v1/query_range?query=${q.metrics}&start=${start}&end=${end}&step=${q.interval}`)
    if (res.status !== "success") {
        console.log("Failed to fetch data from prometheus", res)
        return {
            error: `${res.errorType}: ${res.error}`,
            data: []
        }
    }


    if (res.data.result.length == 0 || res.data.result[0].values.length == 0) {
        return {
            error: null,
            data: []
        }
    }

    let data = prometheusToPanels(res.data, panel, q, range);
    return {
        error: null,
        data: data,
    }
}


export const checkAndTestPrometheus = async (ds: Datasource) => {
    // check datasource setting is valid
    const res = isPromethesDatasourceValid(ds)
    if (res != null) {
        return res
    }

    // test connection status
    try {
        // http://localhost:9090/api/v1/labels?match[]=up
        const res = await requestApi.get(`/proxy?proxy_url=${ds.url}/api/v1/labels?match[]=up`)
        if (res.status) {
            return true
        }

        return "test failed"
    } catch (error) {
        return error.message
    }
}

export const queryPromethuesVariableValues = async (variable: Variable) => {
    let result = {
        error: null,
        data: []
    }

    const data = isJSON(variable.value) ? JSON.parse(variable.value) : null
    if (!data) {
        return result
    }

    const timeRange = getNewestTimeRange()
    const start = timeRange.start.getTime() / 1000
    const end = timeRange.end.getTime() / 1000


    if (data.type == PromDsQueryTypes.LabelValues) {
        if (data.label) {
            // query label values : https://prometheus.io/docs/prometheus/latest/querying/api/#querying-label-values
            const metrics = replaceWithVariablesHasMultiValues(data.metrics)
            for (const m of metrics) {
                //@performance: should pass all metrics in on request &match[]
                const url = `/proxy/${variable.datasource}/api/v1/label/${data.label}/values?${data.useCurrentTime ? `&start=${start}&end=${end}` : ""}${m ? `&match[]=${m}` : ''}`
                const res: any = await requestApi.get(url)
                if (res.status == "success") {
                    result.data = result.data.concat(res.data)
                } else {
                    result.error = res.error
                }
            }
    
        }
    } else if (data.type == PromDsQueryTypes.Metrics) {
        if (!isEmpty(data.regex)) {
            const res = await queryPrometheusAllMetrics(variable.datasource, data.useCurrentTime)
            if (res.error) {
                result.error = res.error
            } else {
                try {
                    const regex = new RegExp(data.regex)
                    result.data = res.data.filter(r => regex.test(r))
                } catch (error) {
                    result.error = error.message
                }

            }
        }
    } else if (data.type == PromDsQueryTypes.LabelNames) {
        result = await queryPrometheusLabels(variable.datasource)
    }

    return result
}

export const queryPrometheusAllMetrics = async (dsId, useCurrentTimerange = true) => {

    const timeRange = getNewestTimeRange()
    const start = timeRange.start.getTime() / 1000
    const end = timeRange.end.getTime() / 1000

    const url = `/proxy/${dsId}/api/v1/label/__name__/values?${useCurrentTimerange ? `&start=${start}&end=${end}` : ""}`

    const res: any = await requestApi.get(url)
    if (res.status == "success") {
        return {
            data: res.data,
            error: null
        }
    } else {
        return {
            data: null,
            error: res.error
        }
    }
}

export const queryPrometheusLabels = async (dsId, metric = "", useCurrentTimerange = true) => {
    const timeRange = getNewestTimeRange()
    const start = timeRange.start.getTime() / 1000
    const end = timeRange.end.getTime() / 1000

    const url = `/proxy/${dsId}/api/v1/labels?${useCurrentTimerange ? `&start=${start}&end=${end}` : ""}${metric ? `&match[]=${metric}` : ''}`
    const res: any = await requestApi.get(url)
    if (res.status == "success") {
        return {
            data: res.data,
            error: null
        }
    } else {
        return {
            data: null,
            error: res.error
        }
    }
}

export const replacePrometheusQueryWithVariables = (query: PanelQuery) => {
    const formats = parseVariableFormat(query.metrics);
    for (const f of formats) {
        const v = variables.find(v => v.name == f)
        if (v) {
            let selected = []
            if (v.selected == VarialbeAllOption) {
                selected = v.values
            } else {
                selected = v.selected?.split(VariableSplitChar) ?? []
            }

            const joined = selected.join('|')
            if (joined) {
                query.metrics = query.metrics.replace(`\${${f}}`,joined );
            }
        }
    }   
}