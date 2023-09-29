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
import { nodeGraphData } from "./mocks/node_graph"
import { prometheusToPanels } from "../prometheus/transformData"
import { Datasource } from "types/datasource"
import traceData from './mocks/traces.json'
import geoData from './mocks/geomapSeriesData.json'
import { Field, SeriesData } from "types/seriesData"
import { getMockLogs } from "./mocks/logs"
import { getMockAlerts } from "./mocks/alerts"
import { externalPanelPlugins } from "../../../external/plugins"
import { builtinPanelPlugins } from "../../plugins"
import { genPrometheusMockData } from "src/views/dashboard/utils/prometheus"

export const run_testdata_query = async (panel: Panel, q: PanelQuery, range: TimeRange, ds: Datasource) => {
    let data: any;

    // switch (panel.type) {
    //     //@needs-update-when-add-new-panel
    //     case PanelType.Stat:
    //     case PanelType.Gauge:
    //     case PanelType.Pie:
    //     case PanelType.Table:
    //     case PanelType.BarGauge:
    //     case PanelType.Echarts:
    //     case PanelType.Bar:
    //         data =  prometheusToPanels(genPrometheusMockData(range,panel.datasource,q), panel, q, range)
    //         break;
    //     case PanelType.NodeGraph:
    //         data = nodeGraphData(6, 0.8)
    //         break;
    //     case PanelType.Trace:
    //         data =  traceData.data
    //         break
    //     case PanelType.GeoMap:
    //         data = geoData
    //         break
    //     case PanelType.Log:
    //         data = getMockLogs(range)
    //         break
    //     default:
    const p = builtinPanelPlugins[panel.type] ?? externalPanelPlugins[panel.type]
    if (p && p.mockDataForTestDataDs) {
        data = p.mockDataForTestDataDs(panel, range, panel.datasource, q)
    }
    //         break
    // }

    return {
        error: null,
        data: data ?? []
    }
}


export const query_testdata_alerts = (panel: Panel, timeRange: TimeRange, ds: Datasource) => {
    const alertsData = getMockAlerts(timeRange)
    alertsData.data["fromDs"] = ds.type
    return {
        error: null,
        data: alertsData.data
    }
}

export const queryTraceInTestData = (traceId) => {
    return traceData.data.find(trace => trace.traceID == traceId)
}

export const transformSchemaDataToSeriesData = (schemaData) => {
    const seriesList: SeriesData[] = []
    for (const sd of schemaData) {
        const fields = sd.schema.fields
        const values = sd.data.values
        const seriesFields: Field[] = []
        let seriesName
        fields.forEach((field, i) => {
            seriesFields.push({
                name: field.name,
                type: field.type,
                values: values[i]
            })
            if (field.config.displayNameFromDS) {
                seriesName = field.config.displayNameFromDS
            }
        })

        const series: SeriesData = {
            queryId: sd.schema.refId,
            name: seriesName,
            rawName: seriesName,
            fields: seriesFields
        }
        seriesList.push(series)
    }

    return seriesList
}