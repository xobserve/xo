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

import { useColorMode, useColorModeValue } from "@chakra-ui/react"
import { getCurrentTimeRange } from "components/DatePicker/TimePicker"
import ChartComponent from "components/charts/Chart"
import { floor, last, round } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import { Panel } from "types/dashboard"
import { Log, LogChartView } from "types/plugins/log"
import { dateTimeFormat } from "utils/datetime/formatter"
import moment from "moment"
import { isEmpty } from "utils/validate"
import { measureText } from "utils/measureText"
import { BarSeries } from "types/plugins/bar"
import { formatUnit } from "components/Unit"


interface Props {
    data: BarSeries[]
    panel: Panel
    width: number
    onSelect: any
}

const BarChart = (props: Props) => {
    const { panel, width, onSelect } = props
    const options = panel.plugins.bar
    const [chart, setChart] = useState<echarts.ECharts>(null)
    const { colorMode } = useColorMode()
    useEffect(() => {
        if (chart) {
            chart.on('click', function (event) {
                if (event.seriesName != "total") {
                    onSelect(event.seriesName)
                }
            })
        }
        return () => {
            chart?.off('click')
        }
    }, [chart])
    let [timeline, names, data] = useMemo(() => {
        const names = []
        const data = []
        if (isEmpty(props.data)) {
            return [[], names, data]
        }
        const timeRange = getCurrentTimeRange()
        let start = round(timeRange.start.getTime()/ 1000)
        let end = round(timeRange.end.getTime() / 1000)

        const dataStart = round(props.data[0].timestamps[0])
        const dataEnd = round(last(props.data[0].timestamps))

        if (dataStart < start) {
            start = dataStart
        }


        // minStep is 1m
        // const minSteps = 10
        // const maxBars = 100
        // const maxSteps = maxBars ?? 20
        
        // const [timeline0, step] = calcStep(start, end, minSteps, maxSteps, )
        // const timeline = timeline0.map(t => t * 1000)
        const now = new Date()




        let timeline = []
        const valueMap = new Map()
        props.data.forEach((series,i) => {
            if (i == 0) {
                timeline = series.timestamps.map(t => t * 1000)
            }

            names.push(series.name)
            data.push(series.values)
        })

        const timeFormat = getTimeFormat(start*1000, now, 0)
        // for (const series of props.data) {
        //     const values = valueMap.get(series.name) ?? {}
        //     series.timestamps.forEach((timestamp, i) => {
        //         const ts = getTimelineBucket(timestamp * 1000, timeline)
        //         values[ts] = (values[ts] ?? 0) + series.values[i]
        //     })
        //     valueMap.set(series.name,values)
        // }
        
        // console.log("here333333:",Array.from(valueMap.keys()))
        // for (const k of Array.from(valueMap.keys())) {
        //     names.push(k)
        //     const v = valueMap.get(k)
        //     const d = []
        //     for (const ts of timeline) {
        //         const v1 = v[ts] ?? null
        //         d.push(v1)
        //     }
        //     data.push(d)
        // }

        return [timeline.map(t => dateTimeFormat(t, { format: timeFormat })), names, data]
    }, [props.data])

    const max = Math.max(...data.flat())
    let stack;
    if (options.stack == "always") {
        stack = "total"
    } else if (options.stack == "none") {
        stack = null
    } else {
        stack = names.length >= 4 ? "total" : null
    }

    const timeFontSize = 11
    const [interval, rotate] = getTimeInterval(width, timeline[0], timeFontSize, timeline.length)
    const chartOptions = {
        animation: true,
        animationDuration: 500,
        tooltip: {
            show: true,
            trigger: options.tooltip == "none" ? "none" : (options.tooltip == "all" ? "axis" : "item"),
            appendToBody: true,
            axisPointer: {
                // Use axis to trigger tooltip
                type: 'none', // 'shadow' as default; can also be 'line' or 'shadow',
            },
            backgroundColor: useColorModeValue("rgba(255,255,255,0.7)", "rgba(255,255,255,0.7)"),
            textStyle: {
                color: useColorModeValue("#444", "#222")
            },
            valueFormatter: (value) => {
                return formatUnit(value, options.value.units, options.value.decimal)
            }
        },
        grid: {
            left: "1%",
            right: "3%",
            top: "4%",
            bottom: '1%',
            padding: 0,
            containLabel: true
        },
        [options.axis.swap ? 'yAxis' : 'xAxis']: {
            type: 'category',
            data: timeline,
            show: true,
            axisTick: {
                alignWithLabel: false,
            },
            axisLabel: {
                show: true,
                textStyle: {
                    align: options.axis.swap ? null : "center",
                    // baseline: 'end',
                },
                interval: interval,
                fontSize: rotate != 0 ? timeFontSize - 1 : timeFontSize,
                // rotate: rotate,
            },
        },
        [options.axis.swap ? 'xAxis' : 'yAxis']: {
            type: 'value',
            splitLine: {
                show: options.showGrid,
            },
            show: true,
            splitNumber: 3,
            axisLabel: {
                fontSize: 11,
                formatter: (value) => {
                    return formatUnit(value, options.value.units, options.value.decimal)
                }
            },
        },
        series: names.map((name, i) => ({
            name: name,
            data: data[i],
            type: 'bar',
            stack: stack,
            label: {
                show: options.showLabel != "none" ? ((width / timeline.length) > 30 ? true : false) : false,
                formatter: (v) => {
                    if (options.showLabel == "always") {
                        return v.data
                    }

                    return (v.data / max) >= 0.2 ? formatUnit(v.data, options.value.units, options.value.decimal) : ''
                },
                fontSize: 11,
            },
            emphasis: {
                // focus: 'series'
            },
            // color: getLabelNameColor(name)
            barWidth: stack == "total" ? "80%" : null
        }))
    };

    return (<>
        <ChartComponent key={colorMode} options={chartOptions} theme={colorMode} onChartCreated={c => setChart(c)} width={width} />
    </>)
}

export default BarChart



// start, end, minStep : second
// step should be 30s, 1m, 5m, 10m, 30m, 1h, 3h, 6h, 12h, 1d
const calcStep = (start, end, minSteps, maxSteps): [number[], number] => {
    const steps = [30, 60, 2 * 60, 5 * 60, 10 * 60, 20 * 60, 30 * 60, 45 * 60, 60 * 60, 2 * 60 * 60, 3 * 60 * 60, 6 * 60 * 60, 12 * 60 * 60, 24 * 60 * 60]
    const interval = end - start

    const allowSteps = []
    for (const s of steps) {
        const c = interval / s
        if (c >= minSteps && c <= maxSteps) {
            allowSteps.push(s)
            break
        }
    }

    const step = Math.max(...allowSteps)
    const firstTs = start + (step - start % step)
    const timeline = []
    for (var i = firstTs; i <= end; i += step) {
        timeline.push(i)
    }

    if (last(timeline) < end) {
        timeline.push(end)
    }

    return [timeline, step]
}

const getTimelineBucket = (timestamp, timeline) => {
    let ts;
    for (var i = 0; i <= timeline.length - 1; i++) {
        if (timestamp <= timeline[i]) {
            ts = timeline[i]
            break
        }
    }

    if (!ts) {
        ts = last(timeline)
    }

    return ts
}

// start, end : ms
// step: second
const getTimeFormat = (start, end, step) => {
    const mstart = moment(start)
    let format;
    if (mstart.isSame(end, "month")) {
        format = ""
    } else {
        format = "M-"
    }

    if (mstart.isSame(end, 'day')) {
        format += "HH:mm"
    } else {
        format += "DD HH:mm"
    }

    if (step < 60) {
        format += ":ss"
    }

    return format
}

const getTimeInterval = (width, format, fontSize, ticks) => {
    const formatWidth = (measureText(format, fontSize).width + 10)
    const allowTicks = floor(width / formatWidth)
    if ((ticks / allowTicks) > 1) {
        return [0, 45]
    }

    return [0, 0]
}