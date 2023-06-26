// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery, PanelType } from "types/dashboard"
import { TimeRange } from "types/time"
import graphData from './mocks/prometheus_graph.json'
import { nodeGraphData } from "./mocks/node_graph"
import { prometheusToSeriesData, prometheusDataToStat, prometheusToPanels } from "../prometheus/transformData"
import {GaugePluginData} from 'types/plugins/gauge'
import { echartsOptions } from "./mocks/echarts"


export const run_testdata_query = async (panel: Panel, q: PanelQuery, range: TimeRange) => {
    let data:any;

    switch (panel.type) {
        //@needs-update-when-add-new-panel
        case PanelType.Graph:
            data = prometheusToSeriesData(graphData.data, q)
            break;
        case PanelType.Stat:
            data = prometheusDataToStat(graphData.data,q)
            break;
        case PanelType.Table:
            data = prometheusToPanels(graphData.data, panel,q)
            break;
        case PanelType.NodeGraph:
            data = nodeGraphData(10, 0.8)
            break;
        case PanelType.Echarts:
            data = echartsOptions
            break
        case PanelType.Gauge:
            const d: GaugePluginData = {
                name: 'Memory Usage',
                value: Math.random() * 100,
            }
            data = d
            break
        case PanelType.Pie:
            data = [
                { value: Math.random() * 50, name: 'rose 1' },
                { value: Math.random() * 50, name: 'rose 2' },
                { value: Math.random() * 50, name: 'rose 3' },
                { value: Math.random() * 50, name: 'rose 4' },
                { value: Math.random() * 50, name: 'rose 5' },
                { value: Math.random() * 50, name: 'rose 6' },
                { value: Math.random() * 50, name: 'rose 7' },
              ]
              break
        default:
            break
    }

    return {
        error: null,
        data: data ?? []
    }
}


