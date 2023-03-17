// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { PanelQuery } from "types/dashboard"
import mockData from "./mocks/data.json"
import { DataFrame, FieldType } from "types/dataFrame"
import { concat } from "lodash"

export const run_prometheus_query = (queries: PanelQuery[]): DataFrame[] => {
    const res = mockData
    if (res.status !== "success") {
        console.log("Failed to fetch data from prometheus", res)
        return []
    }

    const queryResults = []
    for (const q of queries) {
        if (res.data.result.length ==0 || res.data.result[0].values.length == 0) {
            continue
        }
        const data = toDataFrame(q, res.data)
        queryResults.push(...data)
    }
    
    return queryResults
}


// "data": {
//     "resultType": "matrix",
//     "result": [
//         {
//             "metric": {
//                 "cpu": "0",
//                 "instance": "localhost:9100",
//                 "job": "node",
//                 "mode": "idle"
//             },
//             "values": [
//                 [
//                     1678865295,
//                     "0.5592903959242473"
//                 ],
const toDataFrame = (query: PanelQuery, data: any): DataFrame[] => {
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
                id: query.id,
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