// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { cloneDeep, isEmpty, round } from "lodash"
import { Panel, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"
import { prometheusToPanels } from "./transformData"
import { Datasource } from "types/datasource"
import { isPromethesDatasourceValid } from "./DatasourceEditor"
import { Variable } from "types/variable"
import { isJSON } from "utils/is"
import { getInitTimeRange } from "components/DatePicker/TimePicker"

import { PromDsQueryTypes } from "./VariableEditor"
import { datasources } from "src/views/App"
import { parseVariableFormat } from "utils/format"
import { variables } from "src/views/dashboard/Dashboard"
import {  VariableSplitChar, VarialbeAllOption } from "src/data/variable"
import { requestApi } from "utils/axios/request"

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

    const res:any = await requestApi.get(`/proxy/${ds.id}/api/v1/query_range?query=${q.metrics}&start=${start}&end=${end}&step=${q.interval}`)
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
        const res0 = await fetch(`${ds.url}/api/v1/labels?match[]=up`)
        const res = await res0.json()
        if (res.status) {
            return true
        }

        return "test failed"
    } catch (error) {
        return error.message
    }
}

export const queryPromethuesVariableValues = async (variable: Variable) => {
    const data = isJSON(variable.value) ? JSON.parse(variable.value) : null
    if (!data) {
        return
    }

    const timeRange = getInitTimeRange()
    const start = timeRange.start.getTime() / 1000
    const end = timeRange.end.getTime() / 1000

    const datasource = datasources.find(ds => ds.id == variable.datasource)


    let result = [];
    if (data.type == PromDsQueryTypes.LabelValues) {
        if ( data.label) {
            // query label values : https://prometheus.io/docs/prometheus/latest/querying/api/#querying-label-values
            const url = `${datasource?.url}/api/v1/label/${data.label}/values?${data.useCurrentTime ? `&start=${start}&end=${end}` : ""}${data.metrics ? `&match[]=${data.metrics}` : ''}`
            const res0 = await fetch(url)
            const res = await res0.json()
            if (res.status == "success") {
                result = res.data
            }
        }
    } else if (data.type == PromDsQueryTypes.Metrics) {
        if (!isEmpty(data.regex)) {
            const res: string[] = await queryPrometheusAllMetrics(variable.datasource, data.useCurrentTime)
            const regex = new RegExp(data.regex)
            result = res.filter(r => regex.test(r))
        }
    } else if (data.type == PromDsQueryTypes.LabelNames) {
        result =  await queryPrometheusLabels(variable.datasource)
    }

    return result
}

export const queryPrometheusAllMetrics = async (dsId, useCurrentTimerange=true) => {
    const datasource = datasources.find(ds => ds.id == dsId)

    const timeRange = getInitTimeRange()
    const start = timeRange.start.getTime() / 1000
    const end = timeRange.end.getTime() / 1000

    const url = `${datasource?.url}/api/v1/label/__name__/values?${useCurrentTimerange ? `&start=${start}&end=${end}` : ""}`

    const res0 = await fetch(url)
    const res = await res0.json()
    if (res.status == "success") {
        return res.data
    }

    return []
}

export const queryPrometheusLabels= async (dsId,metric="", useCurrentTimerange = true) => {   
    const datasource = datasources.find(ds => ds.id == dsId)

    const timeRange = getInitTimeRange()
    const start = timeRange.start.getTime() / 1000
    const end = timeRange.end.getTime() / 1000
    
    const url = `${datasource?.url}/api/v1/labels?${useCurrentTimerange ? `&start=${start}&end=${end}`  : ""}${metric ? `&match[]=${metric}` : ''}`
    const res0 = await fetch(url)
    const res = await res0.json()
    if (res.status == "success") {
        return res.data
    }

    return []
}

export const replacePrometheusQueryWithVariables = (query: PanelQuery) => {
    const formats = parseVariableFormat(query.metrics);
    for (const f of formats) {
        const v = variables.find(v => v.name ==f)
        if (v) {
            let selected = []
            if (v.selected == VarialbeAllOption) {
                selected = v.values
            } else {
                selected = v.selected?.split(VariableSplitChar)??[]
            }
            
            query.metrics = query.metrics.replace(`\${${f}}`, selected.join('|'));
        }
    }
}