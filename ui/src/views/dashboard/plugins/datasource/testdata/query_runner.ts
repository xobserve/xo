// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery, PanelType } from "types/dashboard"
import { DataFrame, FieldType } from "types/dataFrame"
import { TimeRange } from "types/time"
import { prometheusDataToDataFrame } from "../prometheus/query_runner"
import graphData from './mocks/prometheus_graph.json'
import { nodeGraphData } from "./mocks/node_graph"
export const run_testdata_query = async (panel: Panel, q: PanelQuery,range: TimeRange) => {
    let data ;
  
    switch (panel.type) {
        case PanelType.Graph:
            data = prometheusDataToDataFrame(q, graphData.data)
            break;
        case PanelType.Table:
            data = prometheusDataToDataFrame(q, graphData.data)
            break;
        case PanelType.NodeGraph:
            data = nodeGraphData(10)
            break;
        default:
            break
    }

    return {
        error: null,
        data: data??[]
    }
}


