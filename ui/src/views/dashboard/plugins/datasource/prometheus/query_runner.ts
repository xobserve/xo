// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { isEmpty } from "lodash"
import { Panel, PanelQuery, PanelType } from "types/dashboard"
import { DataFrame, FieldType } from "types/dataFrame"
import { TimeRange } from "types/time"
import { transformPrometheusData } from "./transformData"

export const run_prometheus_query = async (panel: Panel,q: PanelQuery,range: TimeRange) => {
    if (isEmpty(q.metrics)) {
        return {
            error: null,
            data:[]
        }
    }
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

    let data = transformPrometheusData(res.data, panel);
    return {
        error: null,
        data: data
    }
}

export const prometheusDataToDataFrame = (data: any): DataFrame[] => {
    let res: DataFrame[] = []
    if (data.resultType === "matrix") {
        for (const m of data.result) {
            const length = m.values.length
            const metric = JSON.stringify(m.metric).replace(/:/g, '=')
            const timeValues = []
            const valueValues = []

            for (const v of m.values) {
                timeValues.push(v[0])
                valueValues.push(parseFloat(v[1]))
            }
            
            res.push({
                name: metric,
                length: length,
                fields: [
                    {
                        name: "Time",
                        type: FieldType.Time,
                        values: timeValues,
                    },
                    {
                        name: "Value",
                        type: FieldType.Number,
                        values: valueValues,
                        labels: m.metric
                    }
                ],
            })
        }
        return res
    }
    return []
}