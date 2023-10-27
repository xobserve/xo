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


import { round } from "lodash"
import { PanelQuery } from "types/dashboard"
import { Edge, NodeGraphData, Node } from "types/panel/plugins"
import { QueryPluginData } from "types/plugin"
import { FieldType, SeriesData } from "types/seriesData"
import { jsonToEqualPairs1, parseLegendFormat } from "./format"
import { alignTimeSeriesData } from "./seriesData"
import { isEmpty } from "./validate"
import { replaceWithVariables } from "./variable"

export const isPluginDisabled = (p) => {
    if (p && p.settings?.disabled) {
        return p.settings.disabled()
    }
}



export const queryPluginDataToTimeSeries = (data: QueryPluginData, query: PanelQuery) => {
    const seriesMap: Record<string, SeriesData> = {}
    const formats = parseLegendFormat(query.legend)

    for (var i = 0; i < data.data.length; i++) {
        const row = data.data[i]
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

        if (!timeFieldName) {
            return []
        }

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
    }


    const res = Object.values(seriesMap)
    for (const s of res) {
        if (!isEmpty(query.legend)) {
            s.name = query.legend
            if (!isEmpty(formats)) {
                for (const format of formats) {
                    const l = s.labels[format]
                    if (l) {
                        s.name = s.name.replaceAll(`{{${format}}}`, l)
                    }
                }
            }
            // replace ${xxx} format with corresponding variables
            s.name = replaceWithVariables(s.name)
        }

    }


    const seriesList = Object.values(seriesMap)
    alignTimeSeriesData(seriesList)

    return seriesList
}


export const queryPluginDataToTable = (data: QueryPluginData, query: PanelQuery) => {
    const series: SeriesData = {
        queryId: query.id,
        name: isEmpty(query.legend) ? query.id.toString() : query.legend,
        fields: []
    }

    data.columns.forEach((c, i) => {
        series.fields.push({
            name: c,
            values: []
        })
    })

    data.data.forEach((row, i) => {
        row.forEach((v, i) => {
            const f = series.fields[i]
            if (!f.type && data.types) {
                f.type = data.types[f.name] ?? typeof v as any
            }
            f.values.push(v)
        })
    })

    return [series]
}


export const queryPluginDataToLogs = (data: {
    logs: QueryPluginData;
    chart: QueryPluginData;
}, query: PanelQuery) => {
    const logs = []
    for (const row of data.logs.data) {
        const log = {}
        row.forEach((v, i) => {
            const name = data.logs.columns[i]
            if (name == "severity") {
                log[name] = isEmpty(v) ? "ok" : v
            } else {
                log[name] = v
            }
        })
        logs.push(log)
    }


    
    const chartColumns = ["ts_bucket", "others", "errors"]
    const chartData = []
    const chartDataMap = {}
    
    if (data.chart) {
        for (const row of data.chart.data) {
            const ts = row[0]
            const v = chartDataMap[ts]
            if (!v) {
                chartDataMap[ts] = {
                    [row[1]]: row[2]
                }
            } else {
                v[row[1]] = row[2]
            }
        }
        Object.keys(chartDataMap).forEach(ts => {
            const v = chartDataMap[ts]
            chartData.push([ts, v["others"]??null, v["errors"]??null])
        })    
    }
  
    return [{
        logs,
        chart: {
            columns: chartColumns,
            data: chartData
        }
    }]
}

export const queryPluginDataToNodeGraph = (data: QueryPluginData, query: PanelQuery): NodeGraphData => {
    const sourceIndex = data.columns.indexOf("src")
    const targetIndex = data.columns.indexOf("dest")
    const callsIndex = data.columns.indexOf("calls")
    const errorsIndex = data.columns.indexOf("errors")
    const p50Index = data.columns.indexOf("p50")
    const p75Index = data.columns.indexOf("p75")
    const p90Index = data.columns.indexOf("p90")
    const p95Index = data.columns.indexOf("p95")
    const p99Index = data.columns.indexOf("p99")

    const nodesMap: Record<string,Node> = {}
    const edges: Edge[] = []
    for (const row of data.data) {
        const callsCount = row[callsIndex]
        const errorsCount = row[errorsIndex]
        const successCount = callsCount- errorsCount
        const latency = round(row[p99Index] / 1000000,1) + 'ms'
        const source = row[sourceIndex]
        const target = row[targetIndex]
        const edge: Edge = {
            source: source,
            target: target,
            label: `${callsCount} / ${errorsCount} / ${latency}`,
            data: {
                callsCount: callsCount,
                success: successCount,
                error: errorsCount,
                p50: round(row[p50Index] / 1000000,1).toString() + 'ms',
                p75: round(row[p75Index] / 1000000,1).toString() + 'ms',
                p90: round(row[p90Index] / 1000000,1).toString() + 'ms',
                p95: round(row[p95Index] / 1000000,1).toString() + 'ms',
                p99: latency,
            }
        }
        edges.push(edge)

        const node = nodesMap[target]
        if (!node) {
            nodesMap[target] = {
                id: target,
                label: target,
                data: { 
                    success: successCount,
                    error: errorsCount,
                }
            }
        } else {
            node.data.success += successCount
            node.data.error += errorsCount
        }

        const srcNode = nodesMap[source]
        if (!srcNode) nodesMap[source] = {
            id: source, 
            label: source,
            data: {}
        }
    }

    const nodes = Object.values(nodesMap)
    return {
        nodes,
        edges
    }
}