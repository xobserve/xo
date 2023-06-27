import { first, isEmpty, last, round } from "lodash";
import { variables } from "src/views/dashboard/Dashboard";
import { Panel, PanelQuery, PanelType } from "types/dashboard";
import { FieldType, GraphPluginData, SeriesData } from "types/plugins/graph";
import { StatPluginData } from "types/plugins/stat";
import { TablePluginData, TableSeries } from "types/plugins/table";
import { TimeRange } from "types/time";
import { ValueCalculationType } from "types/value";
import { parseLegendFormat } from "utils/format";
import { replaceWithVariables } from "utils/variable";


export const prometheusToPanels = (rawData: any, panel: Panel, query: PanelQuery, range: TimeRange) => {
    if (isEmpty(rawData)) {
        return null
    }

    switch (panel.type) {
        case PanelType.Table:
            return prometheusToTableData(rawData, query)

        case PanelType.Graph:
            return prometheusToSeriesData(rawData, query, range)

        case PanelType.Stat:
            return prometheusDataToStat(rawData, query, panel.plugins.stat.value.calc, range)
    }

    return null
}

export const prometheusToSeriesData = (data: any, query: PanelQuery, range: TimeRange): SeriesData[] => {
    const formats = parseLegendFormat(query.legend)

    if (!query.step) {
        query.step = 15
    }

    console.log("here33333")
    let res: GraphPluginData = []
    if (data.resultType === "matrix") {
        for (const m of data.result) {
            const length = m.values.length
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
                            valueValues.push(v[1])
                        } else if (round(v[0]) > start) {
                            timeValues.push(start)
                            valueValues.push(null)
                        }
                    }


                    const lastTs = last(timeValues)

                    for (let i = lastTs + query.step; i <= v[0]; i += query.step) {
                        if (i < v[0]) {
                            timeValues.push(i)
                            valueValues.push(null)
                        } else {
                            timeValues.push(v[0])
                            valueValues.push(v[1])
                        }
                    }
                })
            }


            const series = {
                id: query.id,
                name: metric,
                length: length,
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
                series.name = replaceWithVariables(series.name, variables)
            }

            res.push(series)
        }
        return res
    }
    return []
}






export const prometheusDataToStat = (data: any, query: PanelQuery, calc: ValueCalculationType, range: TimeRange): StatPluginData => {
    const series: GraphPluginData = prometheusToSeriesData(data, query, range)
    const d: StatPluginData = {
        series: series,
        value: 0
    }
    if (series.length > 0) {
        d.value = calcValueOnSeriesData(series[0], calc)
    }

    return d
}

export const calcValueOnSeriesData = (series: SeriesData, calc: ValueCalculationType) => {
    const values = series.fields[1].values
    if (!calc) {
        return last(values)
    }

    switch (calc) {
        case ValueCalculationType.Average:
            return values.reduce((a, b) => a + b, 0) / values.length
        case ValueCalculationType.Min:
            return Math.min(...values)
        case ValueCalculationType.Max:
            return Math.max(...values)
        case ValueCalculationType.Sum:
            return values.reduce((a, b) => a + b, 0)
        case ValueCalculationType.Last:
            return last(values)
        case ValueCalculationType.First:
            return first(values)
        case ValueCalculationType.Count:
            return values.length
        default:
            return last(values)
    }
}

export const prometheusToTableData = (rawData: any, query: PanelQuery) => {
    const columns = [{
        Header: "Time",
        canFilter: true
    }, {
        Header: "Value",
        canFilter: true
    }]
    const data: TablePluginData = []

    const d = rawData.result
    for (const m of d) {
        const series: TableSeries = {
            columns: columns,
            name: JSON.stringify(m.metric).replace(/:/g, '='),
            rows: []
        }
        for (const v of m.values) {
            series.rows.push({
                Time: v[0],
                Value: round(parseFloat(v[1]), 5)
            })
        }

        data.push(series)
    }
}
