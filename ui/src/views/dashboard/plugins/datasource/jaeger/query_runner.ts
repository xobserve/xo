// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery } from "types/dashboard"
import { Datasource } from "types/datasource"
import { TimeRange } from "types/time"
import { isJaegerDatasourceValid } from "./DatasourceEditor"
import { isJSON } from "utils/is"

export const run_jaeger_query = async (panel: Panel, q: PanelQuery,range: TimeRange,ds: Datasource) => {
    //@todo: 
    // 1. rather than query directyly to prometheus, we should query to our own backend servie
    // 2. using `axios` instead of `fetch`
    
    const res0 = await fetch(`http://localhost:9090/api/v1/query_range?query=${q.metrics}&start=${range.start.getTime() / 1000}&end=${range.end.getTime() / 1000}&step=15`)
     
    const res = await res0.json()
    
    if (res.status !== "success") {
        console.log("Failed to fetch data from prometheus", res)
        return {
            error: `${res.errorType}: ${res.error}`,
            data: []
        }
    }
    

    if (res.data.result.length ==0 || res.data.result[0].values.length == 0) {
        return {
            error: null,
            data:[]
        }
    }


    const data =  []
    return {
        error: null,
        data: data
    }
}

export const queryDependencies = async (url: string, range: TimeRange) => {
    const start= range.start.getTime()
    const end = range.end.getTime()

    const res0 = await fetch(`${url}/api/dependencies?endTs=${end}&loopback=${end-start}`)
    const res = await res0.json()

    if (!isJSON(res)) {
        return {
            error: "Invalid response from Jaeger",
            data: []
        }
    }

    return {
        error: null,
        data: res.data
    }
}

export const checkAndTestJaeger = async (ds:Datasource) => {
    // check datasource setting is valid
    const res = isJaegerDatasourceValid(ds)
    if (res != null) {
        return res
    }

    // test connection status
    try {
        // http://localhost:9090/api/v1/labels?match[]=up
        const now = new Date()
        const timeRange = {
            start: new Date(now.getTime() - 1000 * 60),
            end: now
        }
        const res = await  queryDependencies(ds.url, timeRange)
        if (!res.error) {
            return true
        }

        return "test failed:" + res.error
    } catch (error) {
        return error.message
    }
}


export const replaceJaegerQueryWithVariables = (query: PanelQuery) => {

}