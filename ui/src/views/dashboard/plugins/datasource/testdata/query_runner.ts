// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery, PanelType } from "types/dashboard"
import { TimeRange } from "types/time"
import graphData from './mocks/prometheus_graph.json'
import { nodeGraphData } from "./mocks/node_graph"
import { prometheusDataToGraph, transformPrometheusData } from "../prometheus/transformData"
export const run_testdata_query = async (panel: Panel, q: PanelQuery, range: TimeRange) => {
    let data;

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
                    text: 'ECharts 入门示例'
                },
                tooltip: {},
                xAxis: {
                    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
                },
                yAxis: {},
                series: [
                    {
                        name: '销量',
                        type: 'bar',
                        data: [5, 20, 36, 10, 10, 20]
                    }
                ]
            }
        default:
            break
    }

    console.log("here333333:",data)
    return {
        error: null,
        data: data ?? []
    }
}


