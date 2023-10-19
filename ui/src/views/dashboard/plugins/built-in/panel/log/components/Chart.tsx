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
import React, { memo, useEffect, useMemo, useState } from "react"
import { Panel } from "types/dashboard"

import { dateTimeFormat } from "utils/datetime/formatter"
import { formatLabelId, getLabelNameColor } from "../utils"
import moment from "moment"
import { isEmpty } from "utils/validate"
import { paletteColorNameToHex } from "utils/colors"
import { getStringColorMapping } from "src/views/dashboard/plugins/components/StringColorMapping"
import { PanelTypeLog, Log } from "../types"
import { PanelTypeAlert,AlertToolbarOptions } from "../../alert/types"
import { getTimeFormatForChart } from "utils/format"


interface Props {
    data: Log[]
    panel: Panel
    width: number
    viewOptions: AlertToolbarOptions
    onSelectLabel?: any
    activeLabels?: string[]
    colorGenerator: any
}

const LogChart = memo((props: Props) => {
    const { panel, width, viewOptions, onSelectLabel, activeLabels, colorGenerator } = props
    const options = panel.type == PanelTypeLog ? panel.plugins.log.chart : panel.plugins.alert.chart
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
    }, [chart])
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

        const timeFormat = getTimeFormatForChart(start, now, step)


        if (viewOptions.barType == "labels") {
            const labelMap = new Map()
            for (const log of props.data) {
                const ts = getTimelineBucket(log, timeline)
                if (typeof log.labels === "string") {
                    const labelId = log.labels
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
                } else {
                    let labeled = false
                    const keys = Object.keys(log.labels)
                    keys.forEach((k,i) => {
                        let labelId
                        if (panel.type == PanelTypeLog && panel.plugins.log.chart.categorize != k ) {
                            if (i < keys.length -1) {
                                return 
                            } 
                            
                            if (!labeled) {
                             labelId = formatLabelId(panel.plugins.log.chart.categorize , undefined)
                            }
                        } else {
                             labelId = formatLabelId(k, log.labels[k])
                             labeled = true
                        }
                        
                        if (activeLabels?.length != 0) {
                            if (!activeLabels.includes(labelId)) {
                                return 
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
                    }) 
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
    }, [props.data,viewOptions.barType])

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
    const [interval, rotate] = getTimeInterval(width, timeline[0], timeFontSize, timeline.length)
    const tooltipOptions = panel.type == PanelTypeAlert ? panel.plugins.alert.chart.tooltip : panel.plugins.log.chart.tooltip
    let tooltipMode = "item"
        if (tooltipOptions == "none") {
            tooltipMode = "none" 
        }  else if (tooltipOptions == "single") {
            tooltipMode = "item"
        } else {
            tooltipMode = "axis"
        }
    const chartOptions = {
        animation: false,
        animationDuration: 500,
        tooltip: {
            show: true,
            trigger: tooltipMode,
            appendToBody: true,
            axisPointer: {
                // Use axis to trigger tooltip
                type: 'none', // 'shadow' as default; can also be 'line' or 'shadow',
            },
        },
        grid: {
            left: "1%",
            right: "3%",
            top: "6%",
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
                    // align: 'center',
                    // baseline: 'end',
                },
                interval: interval,
                fontSize: rotate != 0 ? timeFontSize - 1 : timeFontSize,
                rotate: rotate,
            },
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false,
            },
            show: stack != "total" || panel.type == PanelTypeAlert,
            splitNumber: 3,
            axisLabel: {
                fontSize: 11
            }
        },
        series: names.map((name, i) => {
            return ({
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
            color: getSeriesColor(name, panel,colorMode,colorGenerator)
            // barWidth: '90%'
        })})
    };

    return (<>
        <ChartComponent key={colorMode} options={chartOptions} clearWhenSetOption theme={colorMode} onChartCreated={c => setChart(c)} width={width} />
    </>)
})

export default LogChart

const getSeriesColor = (name:string, panel: Panel, colorMode, colorGenerator) => {
    const kv = name.split("=")
    if (kv.length == 1 ) {
        return getLabelNameColor(name,colorMode,colorGenerator)
    }
    
    if (kv[0] == panel.plugins.log?.chart.categorize) {
        const color = paletteColorNameToHex(getStringColorMapping(kv[1],panel.plugins.log.styles.labelValueColor))
        return color != "inherit" ? color : getLabelNameColor(name,colorMode,colorGenerator)
    }

    return getLabelNameColor(name,colorMode,colorGenerator)
}

// start, end, minStep : second
// step should be 30s, 1m, 5m, 10m, 30m, 1h, 3h, 6h, 12h, 1d
const calcStep = (start, end, minSteps, maxSteps): [number[], number] => {
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


const getTimeInterval = (width, format, fontSize, ticks) => {
    // const formatWidth = (measureText(format, fontSize).width + 10)
    // const allowTicks = floor(width / formatWidth)
    // if ((ticks / allowTicks) > 1) {
    //     return [0, 45]
    // }

    return [null, 0]
}