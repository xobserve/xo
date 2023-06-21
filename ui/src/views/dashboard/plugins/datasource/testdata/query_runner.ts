// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery, PanelType } from "types/dashboard"
import { TimeRange } from "types/time"
import graphData from './mocks/prometheus_graph.json'
import { nodeGraphData } from "./mocks/node_graph"
import { prometheusDataToGraph, transformPrometheusData } from "../prometheus/transformData"
import { round } from "lodash"
import {GaugePluginData} from 'types/plugins/gauge'
export const run_testdata_query = async (panel: Panel, q: PanelQuery, range: TimeRange) => {
    let data:any;

    switch (panel.type) {
        //@needs-update-when-add-new-panel
        case PanelType.Graph:
            data = prometheusDataToGraph(graphData.data)
            break;
        case PanelType.Table:
            data = transformPrometheusData(graphData.data, panel)
            break;
        case PanelType.NodeGraph:
            data = nodeGraphData(10, 0.8)
            break;
        case PanelType.Echarts:
            data =  {
                title: {
                    text: `Sunface's collections`
                },
                tooltip: {},
                xAxis: {
                    data: ["My Books","My Shirts", "My Shoes"]
                },
                yAxis: {},
                series: [
                    {
                        name: 'Sunface',
                        type: 'bar',
                        data: [34, 7, 3]
                    }
                ]
            }
            break
        case PanelType.Gauge:
            const d: GaugePluginData = {
                value: Math.random() * 100,
            }
            data = d
            break
        default:
            break
    }

    console.log("here333333:",data)
    return {
        error: null,
        data: data ?? []
    }
}


