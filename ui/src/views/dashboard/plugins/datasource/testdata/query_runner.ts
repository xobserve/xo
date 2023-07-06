// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery, PanelType } from "types/dashboard"
import { TimeRange } from "types/time"
import graphData from './mocks/prometheus_graph.json'
import { nodeGraphData } from "./mocks/node_graph"
import { prometheusToSeriesData, prometheusToPanels } from "../prometheus/transformData"
import { GaugePluginData } from 'types/plugins/gauge'
import { echartsOptions } from "./mocks/echarts"
import { Datasource } from "types/datasource"
import traceData from './mocks/trace.json'

export const run_testdata_query = async (panel: Panel, q: PanelQuery, range: TimeRange,ds: Datasource) => {
    let data: any;

    switch (panel.type) {
        //@needs-update-when-add-new-panel
        case PanelType.Graph:
        case PanelType.Stat:
        case PanelType.Gauge:
        case PanelType.Pie:
        case PanelType.Table:
            data = prometheusToPanels(graphData.data, panel, q, range)
            break;
        case PanelType.NodeGraph:
            data = nodeGraphData(10, 0.8)
            break;
        case PanelType.Echarts:
            data = echartsOptions
            break
        case PanelType.Trace:
            data = traceData
            break
        default:
            break
    }

    return {
        error: null,
        data: data ?? []
    }
}


