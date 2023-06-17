import { isEmpty, round } from "lodash";
import { Panel, PanelType } from "types/dashboard";
import {  TablePluginData, TableSeries } from "types/plugins/table";
import { prometheusDataToDataFrame } from "./query_runner";

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
            return  prometheusDataToDataFrame(rawData)
        default:
            break;
    }


    return null
}