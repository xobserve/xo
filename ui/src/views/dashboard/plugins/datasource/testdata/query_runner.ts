// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery, PanelType } from "types/dashboard"
import { TimeRange } from "types/time"
import graphData from './mocks/prometheus_graph.json'
import { nodeGraphData } from "./mocks/node_graph"
import { prometheusToPanels } from "../prometheus/transformData"
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
        case PanelType.BarGauge:
            data = prometheusToPanels(graphData.data, panel, q, range)
            break;
        case PanelType.NodeGraph:
            data = nodeGraphData(10, 0.8)
            break;
        case PanelType.Echarts:
            data = echartsOptions
            break
        case PanelType.Trace:
            data =  traceData.data
            break
        default:
            break
    }

    return {
        error: null,
        data: data ?? []
    }
}


