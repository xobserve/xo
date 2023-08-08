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
import { floor, round } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import { Panel } from "types/dashboard"
import { dateTimeFormat } from "utils/datetime/formatter"
import moment from "moment"
import { isEmpty } from "utils/validate"
import { measureText } from "utils/measureText"
import { BarSeries } from "types/plugins/bar"
import { formatUnit } from "components/Unit"
import { calculateInterval } from "utils/datetime/range"
import { DatasourceMaxDataPoints, DatasourceMinInterval } from "src/data/constants"
import { alpha } from "components/uPlot/colorManipulator"


interface Props {
    data: BarSeries[]
    panel: Panel
    width: number
    height:number
    onSelect: any
}

const BarChart = (props: Props) => {
    const { panel, width, onSelect,height } = props
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
        const dataStart = round(props.data[0].timestamps[0])
        if (dataStart < start) {
            start = dataStart
        }

        const now = new Date()
        let timeline = []
        props.data.forEach((series,i) => {
            if (i == 0) {
                timeline = series.timestamps.map(t => t * 1000)
            }

            names.push(series.name)
            data.push(series.values)
        })

        const ds = panel.datasource
        const intervalObj =  calculateInterval(timeRange, ds.queryOptions.maxDataPoints ?? DatasourceMaxDataPoints, isEmpty(ds.queryOptions.minInterval) ? DatasourceMinInterval : ds.queryOptions.minInterval)    
        const timeFormat = getTimeFormat(start*1000, now.getTime(), intervalObj.intervalMs / 1000)
    
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
    const [interval, rotate] = getTimeInterval(width, timeline[0], timeFontSize, timeline.length)

    let showLabel;
    if (options.showLabel == "always") {
        showLabel = true
    } else if (options.showLabel == "none") {
        showLabel = false
    } else { // auto
        showLabel = (width / timeline.length) > 40 ? true : false
    }

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
                    // align: "end"
                    // baseline: 'end',
                },
                interval: interval,
                fontSize: options.styles.axisFontSize,
                rotate: options.axis.swap ? 0 : rotate,
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
                fontSize:  options.styles.axisFontSize,
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
                show: showLabel,
                formatter: (v) => {
                    const value = formatUnit(v.data, options.value.units, options.value.decimal)
                    if (options.showLabel == "always") {
                        return value
                    }

                    return (v.data / max) >= 0.2 ? value : ''
                },
                fontSize:  options.styles.labelFontSize,
            },
            emphasis: {
                // focus: 'series'
            },
            color: alpha(props.data.find(s => s.name == name)?.color, options.styles.barOpacity / 100)  ,
            barWidth: stack == "total" ? `${options.styles.barWidth}%` : `${options.styles.barWidth/names.length}%`
        }))
    };

    return (<>
        <ChartComponent key={colorMode} options={chartOptions} theme={colorMode} onChartCreated={c => setChart(c)} width={width} />
    </>)
}

export default BarChart



// start, end : ms
// step: second
const getTimeFormat = (start, end, step) => {
    const mstart = moment(start)
    const mend = moment(end)
    let format;
    if (mstart.isSame(mend, "month")) {
        format = ""
    } else {
        format = "M-"
    }

    if (mstart.isSame(mend, 'day')) {
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
    // console.log("here333333:",ticks, allowTicks, ticks / allowTicks)
    // if ((ticks / allowTicks) > 6) {
    //     return [null, 0]
    // }

    // if ((ticks / allowTicks) > 2.5) {
    //     return [null, 0]
    // }

    // if ((ticks / allowTicks) > 2) {
    //     return [1, 0]
    // }

    return [null, 0]
}