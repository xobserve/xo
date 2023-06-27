// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { isEmpty, round } from "lodash"
import { Panel, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"
import { prometheusToPanels } from "./transformData"

export const run_prometheus_query = async (panel: Panel,q: PanelQuery,range: TimeRange) => {
    if (isEmpty(q.metrics)) {
        return {
            error: null,
            data:[]
        }
    }

    const start = round(range.start.getTime() / 1000)
    const end = range.end.getTime() / 1000

    //@todo: 
    // 1. rather than query directyly to prometheus, we should query to our own backend servie
    // 2. using `axios` instead of `fetch`
    
    const res0 = await fetch(`http://localhost:9090/api/v1/query_range?query=${q.metrics}&start=${start}&end=${end}&step=${q.interval}`)
     
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

    let data = prometheusToPanels(res.data, panel, q, range);
    return {
        error: null,
        data: data
    }
}
