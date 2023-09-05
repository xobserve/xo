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

import { useColorMode } from "@chakra-ui/react"
import { getCurrentTimeRange } from "src/components/DatePicker/TimePicker"
import ChartComponent from "src/components/charts/Chart"
import { floor, last, round } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import { Panel, PanelType } from "types/dashboard"
import { dateTimeFormat } from "utils/datetime/formatter"
import moment from "moment"
import { isEmpty } from "utils/validate"
import { measureText } from "utils/measureText"
import { AlertToolbarOptions } from "types/plugins/alert"
import { getLabelNameColor } from "../../log/utils"


export interface AlertChartItem {
        label: string
        timestamp: number  // nanoseconds
}

interface Props {
    data: AlertChartItem[]
    panel: Panel
    width: number
    viewOptions: AlertToolbarOptions
    onSelectLabel: any
    activeLabels: string[]
}

const AlertChart = (props: Props) => {
    const { panel, width ,viewOptions, onSelectLabel,activeLabels} = props
    const options = panel.type == PanelType.Log?  panel.plugins.log.chart : panel.plugins.alert.chart
    const [chart, setChart] = useState<echarts.ECharts>(null)
    const { colorMode } = useColorMode()
    useEffect(() => {
        if (chart) {
            chart.on('click', function (event) {
                if (event.seriesName != "total") {
                    onSelectLabel(event.seriesName)
                }        
            })
        }
        return () => {
            chart?.off('click')
        }
    },[chart])
    let [timeline, names, data] = useMemo(() => {
        const names = []
        const data = []
        if (isEmpty(props.data)) {
            return [[], names, data]
        }
        const timeRange = getCurrentTimeRange()
        let start = round(timeRange.start.getTime())
        let end = round(timeRange.end.getTime())
        let dataStart = round(props.data[0].timestamp / 1e6)
        //@ts-ignore
        if (options?.orderBy == "newest") {
            dataStart = round(last(props.data).timestamp / 1e6)
        }

        if (dataStart < start) {
            start = dataStart
        }

        // minStep is 1m
        const minSteps = 10
        const maxSteps = viewOptions.maxBars ?? 20
        const [timeline0, step] = calcStep(round(start / 1000), round(end / 1000), minSteps, maxSteps)
        const timeline = timeline0.map(t => t * 1000)
        const now = new Date()

        const timeFormat = getTimeFormat(start, now, step)


        if ((viewOptions.barType) == "labels") {
            const labelMap = new Map()
            for (const log of props.data) {
                const ts = getTimelineBucket(log, timeline)
                    const labelId = log.label
                    if (activeLabels.length != 0) {
                        if (!activeLabels.includes(labelId)) {
                            continue
                        }
                    }
                    const old = labelMap.get(labelId)
                    if (!old) {
                        labelMap.set(labelId, {
                            [ts]: 1
                        })
                    } else {
                        old[ts] = old[ts] ? old[ts] + 1 : 1
                    }
                }

            for (const k of Array.from(labelMap.keys())) {
                names.push(k)
                const v = labelMap.get(k)
                const d = []
                for (const ts of timeline) {
                    const v1 = v[ts] ?? null
                    d.push(v1)
                }
                data.push(d)
            }
        } else {
            names.push("total")
            const totalMap = new Map()
            for (const log of props.data) {
                const ts = getTimelineBucket(log, timeline)
                const old = totalMap.get(ts)
                if (!old) {
                    totalMap.set(ts, 1)
                } else {
                    totalMap.set(ts, old + 1)
                }
            }

            const d = []
            for (const ts of timeline) {
                const count = totalMap.get(ts) ?? null
                d.push(count)
            }
            data.push(d)
        }

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

    const timeFontSize = 10
    const [interval,rotate] = getTimeInterval(width, timeline[0], timeFontSize, timeline.length)
    const chartOptions = {
        animation: true,
        animationDuration: 500,
        tooltip: {
            show: true,
            trigger: 'axis',
            appendToBody: true,
            axisPointer: {
                // Use axis to trigger tooltip
                type: 'none', // 'shadow' as default; can also be 'line' or 'shadow',
            }
        },
        grid: {
            left: "1%",
            right: "3%",
            top: "4%",
            bottom: '0%',
            padding: 0,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: timeline,
            show: true,
            axisTick: {
                alignWithLabel: false,
            },
            axisLabel: {
                show: true,
                textStyle: {
                    align: 'center',
                    // baseline: 'end',
                },
                interval: interval,
                fontSize: rotate != 0 ? timeFontSize - 1: timeFontSize,
                rotate: rotate,
            },
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false,
            },
            show: stack != "total",
            splitNumber: 3,
            axisLabel: {
                fontSize: 11
            }
        },
        series: names.map((name, i) => ({
            name: name,
            data: data[i],
            type: 'bar',
            stack: stack,
            label: {
                show: options.showLabel != "none" ? true : false,
                formatter: (v) => {
                    if (options.showLabel == "always") {
                        return v.data
                    }

                    return (v.data / max) >= 0.2 ? v.data : ''
                },
                fontSize: 11,
            },
            emphasis: {
                focus: 'series'
            },
            color: getLabelNameColor(name, colorMode)
            // barWidth: '90%'
        }))
    };

    return (<>
        <ChartComponent key={colorMode} options={chartOptions} theme={colorMode} onChartCreated={c => setChart(c)} width={width} />
    </>)
}

export default AlertChart



// start, end, minStep : second
// step should be 30s, 1m, 5m, 10m, 30m, 1h, 3h, 6h, 12h, 1d
export const calcStep = (start, end, minSteps, maxSteps): [number[], number] => {
    const steps = [30, 60, 2 * 60, 5 * 60, 10 * 60, 20 * 60, 30 * 60, 45 * 60, 60 * 60, 2 * 60 * 60, 3 * 60 * 60, 6 * 60 * 60, 12 * 60 * 60, 24 * 60 * 60]
    const interval = end - start

    let step;
    for (const s of steps) {
        const c = interval / s
        if (c >= minSteps && c <= maxSteps) {
            step = s
            break
        }
    }

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

const getTimelineBucket = (log, timeline) => {
    let ts;
    const timestamp = round(Number(log.timestamp) / 1e6)
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
    if ((ticks / allowTicks) > 1 ) {
        return [0,45]
    }

    return [0,0]
}