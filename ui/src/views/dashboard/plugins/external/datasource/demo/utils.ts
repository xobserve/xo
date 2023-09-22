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
import { setPanelRealTime } from "src/views/dashboard/store/panelRealtime";
import { Panel, PanelQuery, PanelType } from "types/dashboard";

import { FieldType, SeriesData } from "types/seriesData";
import { TimeRange } from "types/time";
import { roundDsTime } from "utils/datasource";
import { parseLegendFormat } from "utils/format";
import { calcSeriesStep } from "utils/seriesData";
import { isEmpty } from "utils/validate";
import { replaceWithVariables } from "utils/variable";


export const demoDataToPanelData= (rawData: any, panel: Panel, query: PanelQuery, range: TimeRange) => {
    if (isEmpty(rawData)) {
        return null
    }

    let expandTimeRange;
    const et = query.data["expandTimeline"]

    if (isEmpty(et) || et == "auto") {
        expandTimeRange = panel.type == PanelType.Graph || panel.type == PanelType.Bar || panel.type == PanelType.Stat
    } else {
        expandTimeRange = et == "always"
    }

    return prometheusToSeriesData(panel, rawData, query, range, expandTimeRange)
}

const prometheusToSeriesData = (panel: Panel, data: any, query: PanelQuery, range: TimeRange, expandTimeRange = false): SeriesData[] => {
    const formats = parseLegendFormat(query.legend)

    let res: SeriesData[] = []
    if (data.resultType === "matrix") {
        for (const m of data.result) {
            // delete m.metric.__name__
            const metric = JSON.stringify(m.metric).replace(/":"/g, '"="')

            let timeValues = []
            let valueValues = []
            
            if (expandTimeRange) {
                if (!isEmpty(m.values)) {
                    let start = roundDsTime(range.start.getTime() / 1000)
                    if (m.values[0][0] < start) {
                        start = roundDsTime(m.values[0][0])
                    }

                    let end = roundDsTime(range.end.getTime() / 1000)

                    if (!query.interval) {
                        const r = calcSeriesStep(start, end, 10, 30)
                        query.interval = r[1]
                    }

                    const timeline = []
                    const alignedStart = start - start % query.interval
                    // console.log("here344443:", start,query.interval, alignedStart)
                    for (var i = alignedStart; i <= end; i = i + query.interval) {
                        timeline.push(i)
                    }

                    // if (timeline[timeline.length-1] != end) {
                    //     timeline.push(end)
                    // }

                    timeValues = timeline
                    valueValues = new Array(timeline.length).fill(null)
                    let currentIndex = 0
                    for (const v of m.values) {
                        const timestamp = roundDsTime(v[0])
                        const value = parseFloat(v[1])
                        const index = timeline.slice(currentIndex).findIndex(t => timestamp <= t)
                        if (index < 0) {
                            continue
                        }
                        const realIndex = index + currentIndex
                        valueValues[realIndex] = value


                        currentIndex = realIndex + 1
                    }
                }
            } else {
                for (const v of m.values) {
                    timeValues.push(v[0])
                    valueValues.push(parseFloat(v[1]))
                }
            }



            const series: SeriesData = {
                // id: query.id,
                name: metric,
                // length: m.values.length,
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

        let timeLength
        let timeLenNotEqual = false
        for (const r of res) {

            for (const f of r.fields) {
                if (f.type == FieldType.Time) {
                    if (timeLength === undefined) {
                        timeLength = f.values.length
                    } else {
                        if (timeLength != f.values.length) {
                            timeLenNotEqual = true
                            break
                        }
                    }
                }
            }
            if (timeLenNotEqual) {
                break
            }
        }

        if (timeLenNotEqual) {
            const timelineBucks = new Set()
            const valueMap = new Map()
            for (const r of res) {
                const timeField = r.fields.find(f => f.type == FieldType.Time)
                const valueField = r.fields.find(f => f.type == FieldType.Number)
                if (timeField) {
                    timeField.values.forEach((t, i) => {
                        timelineBucks.add(t)
                        const v = valueMap.get(t) ?? {}
                        v[r.name] = valueField.values[i]
                        valueMap.set(t, v)
                    })
                }
            }


            const timeline = Array.from(timelineBucks).sort()
            for (const r of res) {
                const valueField = r.fields.find(f => f.type == FieldType.Number)
                const newValues = []
                timeline.forEach(t => {
                    const v = valueMap.get(t)
                    if (v) {
                        newValues.push(v[r.name] ?? null)
                    } else {
                        newValues.push(null)
                    }
                })
                valueField.values = newValues
                const timeField = r.fields.find(f => f.type == FieldType.Time)
                timeField.values = timeline
            }
        }
        if (res.length > 0) {
            const timeline = res[0].fields.find(f => f.type == FieldType.Time).values
            setPanelRealTime(panel.id, timeline)
        }
        return res
    }
    return []
}

