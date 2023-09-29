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

import { Panel, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"
import { Datasource } from "types/datasource"
import { Field, SeriesData } from "types/seriesData"
import { getMockAlerts } from "./mocks/alerts"
import { externalPanelPlugins } from "../../../external/plugins"
import { builtinPanelPlugins } from "../../plugins"

export const run_testdata_query = async (panel: Panel, q: PanelQuery, range: TimeRange, ds: Datasource) => {
    let data: any;

    const p = builtinPanelPlugins[panel.type] ?? externalPanelPlugins[panel.type]
    if (p && p.mockDataForTestDataDs) {
        data = p.mockDataForTestDataDs(panel, range, panel.datasource, q)
    }

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