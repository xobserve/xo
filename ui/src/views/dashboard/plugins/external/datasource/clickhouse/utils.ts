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
import { Panel, PanelQuery } from "types/dashboard";

import { FieldType, SeriesData } from "types/seriesData";
import { TimeRange } from "types/time";
import {  jsonToEqualPairs1, parseLegendFormat } from "utils/format";
import { isEmpty } from "utils/validate";
import { replaceWithVariables } from "utils/variable";
import { PanelTypeGraph } from "../../../built-in/panel/graph/types";
import { PanelTypeBar } from "../../../built-in/panel/bar/types";
import { PanelTypeStat } from "../../../built-in/panel/stat/types";
import { ChPluginData } from "./types";
import { DataFormat } from "types/format";


export const clickhouseToPanelData = (data: ChPluginData, panel: Panel, query: PanelQuery, range: TimeRange) => {
    if (isEmpty(data) || data.columns.length == 0 || data.data.length == 0) {
        return null
    }

    let expandTimeRange;
    const et = query.data["expandTimeline"]

    if (isEmpty(et) || et == "auto") {
        expandTimeRange = panel.type == PanelTypeGraph || panel.type == PanelTypeBar || panel.type == PanelTypeStat
    } else {
        expandTimeRange = et == "always"
    }

    switch (query.data["format"]) {
        case DataFormat.TimeSeries:
            return toTimeSeries(data, query)
        case DataFormat.Table:
            return toTable(data, query)
        default:
            return toTimeSeries(data, query)
    }
}


const toTimeSeries = (data: ChPluginData,  query: PanelQuery) => {
    const seriesMap: Record<string,SeriesData> = {}
    const formats = parseLegendFormat(query.legend)
    
    data.data.forEach((row, i) => {
        const labels = {}
        let timeValue;
        let timeFieldName;
        let value;
        let valueFieldName;
        row.forEach((v, i) => {
            const labelName = data.columns[i]
            const valueType = data.types[labelName] ?? typeof v as any
            if (valueType == FieldType.Time) {
                if (!timeValue) {
                    timeValue = v
                    timeFieldName = labelName
                }
            } else if (valueType == FieldType.Number) {
                if (!value) {
                    value = v
                    valueFieldName = labelName
                }
            } else {
                labels[labelName] = v
            }
        })
        
        let seriesName;
        if (isEmpty(labels)) {
            seriesName = query.id
        } else {
            seriesName = jsonToEqualPairs1(labels)
        }

        const series = seriesMap[seriesName]
        if (!series) {
            seriesMap[seriesName] = {
                queryId: query.id,
                name: seriesName,
                labels: labels,
                fields: [
                    {
                        name: timeFieldName,
                        type: FieldType.Time,
                        values: [timeValue]
                    },
                    {
                        name: valueFieldName,
                        type: FieldType.Number,
                        values: [value]
                    },
                ]
            }
        } else {
            series.fields[0].values.push(timeValue)
            series.fields[1].values.push(value)
        }
    })

    const res = Object.values(seriesMap)
    for (const s of res) {
        if (!isEmpty(query.legend)) {
            s.name = query.legend
            if (!isEmpty(formats)) {
                for (const format of formats) {
                    const l = s.labels[format]
                    if (l) {
                        s.name= s.name.replaceAll(`{{${format}}}`, l)
                    }
                }
            }
            // replace ${xxx} format with corresponding variables
            s.name= replaceWithVariables(s.name)
        }

    }
    console.log("here33333:",Object.values(seriesMap))
   
    return  Object.values(seriesMap)
}


const toTable= (data: ChPluginData,  query: PanelQuery) => {
    const series: SeriesData = {
        queryId: query.id,
        name: isEmpty(query.legend) ?  query.id.toString()  : query.legend,
        fields: []
    }

    data.columns.forEach((c,i) => {
        series.fields.push({
            name: c,
            values: []
        })
    })

    data.data.forEach((row,i) => {
        row.forEach((v,i) => {
            const f = series.fields[i]
            if (!f.type) {
                f.type = data.types[f.name] ?? typeof v as any
            }
            f.values.push(v)
        })
    })

    return [series]
}

