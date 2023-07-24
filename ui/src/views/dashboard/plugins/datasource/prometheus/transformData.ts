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
import { first, isEmpty, last, round } from "lodash";
import { Panel, PanelQuery, PanelType } from "types/dashboard";

import { FieldType, SeriesData } from "types/seriesData";
import { TimeRange } from "types/time";
import { parseLegendFormat } from "utils/format";
import { replaceWithVariables } from "utils/variable";


export const prometheusToPanels = (rawData: any, panel: Panel, query: PanelQuery, range: TimeRange) => {
    if (isEmpty(rawData)) {
        return null
    }

    return prometheusToSeriesData(rawData, query, range)
}

export const prometheusToSeriesData = (data: any, query: PanelQuery, range: TimeRange): SeriesData[] => {
    const formats = parseLegendFormat(query.legend)

    let res: SeriesData[] = []
    if (data.resultType === "matrix") {
        for (const m of data.result) {
            const metric = JSON.stringify(m.metric).replace(/:/g, '=')

            const timeValues = []
            const valueValues = []

            if (!isEmpty(m.values)) {
                let start = round(range.start.getTime() / 1000)
                if (m.values[0][0] <= start) {
                    start = round(m.values[0][0])
                }

                m.values.forEach((v, i) => {
                    if (i == 0) {
                        if (round(v[0]) == start) {
                            timeValues.push(start)
                            valueValues.push(parseFloat(v[1]))
                        } else if (round(v[0]) > start) {
                            timeValues.push(start)
                            valueValues.push(null)
                        }
                    }


                    const lastTs = last(timeValues)

                    for (let i = lastTs + query.interval; i <= v[0]; i += query.interval) {
                        if (i < v[0]) {
                            timeValues.push(i)
                            valueValues.push(null)
                        } else {
                            timeValues.push(v[0])
                            valueValues.push(parseFloat(v[1]))
                        }
                    }
                })
            }


            const series:SeriesData = {
                id: query.id,
                name: metric,
                length:  m.values.length,
                fields: [
                    {
                        name: "Time",
                        type: FieldType.Time,
                        values: timeValues,
                    },
                    {
                        name: "Value",
                        type: FieldType.Number,
                        values: valueValues,
                        labels: m.metric
                    }
                ],
            }

            // replace legend format of promethues datasource with corresponding labels
            if (!isEmpty(query.legend)) {
                series.name = query.legend
                if (!isEmpty(formats)) {
                    for (const format of formats) {
                        const l = series.fields[1].labels[format]
                        if (l) {
                            series.name = series.name.replaceAll(`{{${format}}}`, l)
                        }
                    }
                }
                // replace ${xxx} format with corresponding variables
                series.name = replaceWithVariables(series.name)
            }

            res.push(series)
        }
        return res
    }
    return []
}

