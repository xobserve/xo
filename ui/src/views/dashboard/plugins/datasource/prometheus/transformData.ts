import { isEmpty, round } from "lodash";
import { Panel, PanelType } from "types/dashboard";
import { FieldType, GraphPluginData } from "types/plugins/graph";
import {  TablePluginData, TableSeries } from "types/plugins/table";

export const transformPrometheusData = (rawData: any, panel: Panel) => {
    if (isEmpty(rawData)) {
        return null
    }

    switch (panel.type) {
        case PanelType.Table:
            const columns = [{
                Header: "Time",
                canFilter: true
            },{
                Header: "Value",
                canFilter: true
            }]
            const data: TablePluginData = []

            const d = rawData.result
            for (const m of d) {
                const series: TableSeries = {
                    columns: columns,
                    name: JSON.stringify(m.metric).replace(/:/g, '='),
                    rows: []
                }
                for (const v of m.values) {
                    series.rows.push({
                        Time: v[0],
                        Value: round(parseFloat(v[1]),5)
                    })
                }

                data.push(series)
            }
            
            return data
        
        case PanelType.Graph:
            return  prometheusDataToGraph(rawData)
        default:
            break;
    }


    return null
}



export const prometheusDataToGraph= (data: any): GraphPluginData => {
    let res: GraphPluginData = []
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