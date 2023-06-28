import { Datasource } from "types/datasource"
import { isHttpDatasourceValid } from "./DatasourceEditor"
import { Variable } from "types/variable"
import { Panel, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"
import { genDynamicFunction } from "utils/dynamicCode"
import { isEmpty, isFunction, round } from "lodash"
import _ from 'lodash'
import { setVariable } from "src/views/variables/Variables"

export const run_http_query = async (panel: Panel, q: PanelQuery,range: TimeRange,ds: Datasource) => {
    //@todo: 
    // 1. rather than query directyly to prometheus, we should query to our own backend servie
    // 2. using `axios` instead of `fetch`
    const start = round(range.start.getTime() / 1000)
    const end = round(range.end.getTime() / 1000)
    let url = q.metrics
    const headers = {}
    if (!isEmpty(q.data.transformRequest)) {
        const transformRequest = genDynamicFunction(q.data.transformRequest);
        if (isFunction(transformRequest)) {
             url = transformRequest(url, headers,start , end, setVariable)
        }  else {
            return {
                error: 'transformRequest is not a valid function',
                data: []
            }
        }
    }
    

    const res0 = await fetch(url)
     
    const res = await res0.json()

    let result = res
    if (!isEmpty(q.data.transformResult)) {
        const transformResult = genDynamicFunction(q.data.transformResult);
        if (isFunction(transformResult)) {
             result = transformResult(res, q, start, end)
        }  else {
            return {
                error: 'transformResult is not a valid function',
                data: []
            }
        }
    }

    
    return {
        error: null,
        data: result
    }
}

export const checkAndTestHttp = async (ds:Datasource) => {
    // check datasource setting is valid
    const res = isHttpDatasourceValid(ds)
    if (res != null) {
        return res
    }

    return true
}


export const queryHttpVariableValues = async (variable:Variable, useCurrentTimerange = true) => {
    // const data = isJSON(variable.value) ? JSON.parse(variable.value) : null
    // if (!data) {
    //     return 
    // }
    
    // const timeRange = getInitTimeRange()
    // const start = timeRange.start.getTime() / 1000
    // const end = timeRange.end.getTime() / 1000

    // const datasource = datasources.find(ds => ds.id == variable.datasource)


    let result;
    // if (data.type == PromDsQueryTypes.LabelValues) {
    //     if (data.metrics && data.label) {
    //         // query label values : https://prometheus.io/docs/prometheus/latest/querying/api/#querying-label-values
    //         const url = `${datasource.url}/api/v1/label/${data.label}/values?${useCurrentTimerange ? `&start=${start}&end=${end}` : ""}&match[]=${data.metrics}`
    //         const res0 = await fetch(url)
    //         const res = await res0.json()
    //         if (res.status == "success") {
    //             result = res.data
    //         }
    //     }
    // }

    return result
}