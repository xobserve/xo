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
import { getCurrentTimeRange } from "components/DatePicker/TimePicker"
import ChartComponent from "components/charts/Chart"
import { last, round } from "lodash"
import React, { useMemo, useState } from "react"
import { Panel } from "types/dashboard"
import { Log } from "types/plugins/log"
import { dateTimeFormat } from "utils/datetime/formatter"
import { formatLabelId } from "../utils"
import moment from "moment"


interface Props {
    data: Log[]
    panel: Panel
    width: number
}

const LogChart = (props: Props) => {
    const { panel, width } = props
    const options = panel.plugins.log.chart
    const [chart, setChart] = useState(null)
    const { colorMode } = useColorMode()
    let [timeline, names, data] = useMemo(() => {
        const names = []
        const data = []
        const timeRange = getCurrentTimeRange()
        let start = round(timeRange.start.getTime())
        let end = round(timeRange.end.getTime())
        let dataStart;
        let dataEnd;
        if (panel.plugins.log.orderBy == "newest") {
            dataStart = round(last(props.data).timestamp / 1e6)
            dataEnd = round(props.data[0].timestamp / 1e6)
        }

        if (dataStart < start) {
            start = dataStart
        }

        // minStep is 1m
        const timeline = calcStep(round(start / 1000), round(end / 1000)).map(t => t * 1000)
        const now = new Date()
        const isInToday = moment(start).isSame(now, 'day')

        if (options.barData == "labels") {
            const labelMap = new Map()
            for (const log of props.data) {
                const ts = getTimelineBucket(log, timeline)
                // console.log("here3444433:", log,timestamp,ts)
                for (const k of Object.keys(log.labels)) {
                    const labelId = formatLabelId(k, log.labels[k])
                    const old = labelMap.get(labelId)
                    if (!old) {
                        labelMap.set(labelId, {
                            [ts]: 1
                        })
                    } else {
                        old[ts] = old[ts] ? old[ts] + 1 : 1
                    }
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

        return [timeline.map(t => dateTimeFormat(t, { format: isInToday ? "HH:mm:ss" : "MM-DD HH:mm:ss" })), names, data]
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

    const chartOptions = {
        animation: true,
        tooltip: {
            show: true,
            trigger: 'axis',
            appendToBody: true
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
                alignWithLabel: false
            },

            axisLabel: {
                show: true,
                textStyle: {
                    align: 'left',
                    baseline: 'middle',
                },
            },
            splitNumber: 10
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false,
            },
            show: stack != "total",
            splitNumber: 3,
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
            // barWidth: '90%'
        }))
    };

    return (<>
        <ChartComponent key={colorMode} options={chartOptions} theme={colorMode} onChartCreated={c => setChart(c)} width={width} />
    </>)
}

export default LogChart



// start, end, minStep : second
// step should be 30s, 1m, 5m, 10m, 30m, 1h, 3h, 6h, 12h, 1d
const calcStep = (start, end) => {
    const steps = [30, 60, 2 * 60, 5 * 60, 10 * 60, 20 * 60, 30 * 60, 45 * 60, 60 * 60, 2 * 60 * 60, 3 * 60 * 60, 6 * 60 * 60, 12 * 60 * 60, 24 * 60 * 60]
    const interval = end - start
    const minSteps = 5
    const maxSteps = 15
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

    return timeline
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