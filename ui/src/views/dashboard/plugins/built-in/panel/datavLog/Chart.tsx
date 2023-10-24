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

import { Text, useColorMode, useColorModeValue } from "@chakra-ui/react"
import ChartComponent from "src/components/charts/Chart"
import React, { memo, useEffect, useMemo, useRef, useState } from "react"
import { Panel } from "types/dashboard"

import { QueryPluginData } from "types/plugin"
import { dateTimeFormat } from "utils/datetime/formatter"
import { getTimeFormatForChart } from "utils/format"
import customColors from "theme/colors"
import {colors1} from 'utils/colors'

interface Props {
    data: QueryPluginData
    panel: Panel
    width: number
    onClick: any
    totalLogs: number
    displayLogs: number
}

const DatavLogChart = memo((props: Props) => {
    const { panel, width, onClick, totalLogs, displayLogs } = props
    const [chart, setChart] = useState<echarts.ECharts>(null)
    const { colorMode } = useColorMode()
    const timelineCache = useRef<string[]>(null)
    const timeBucksCache = useRef<string[]>(null)
    const stepCache = useRef(null)
    useEffect(() => {
        if (chart) {
            chart.on('click', function (event) {
                const index = timelineCache.current.findIndex(t => t == event.name)
                const ts = timeBucksCache.current[index]
                onClick(ts, event.seriesName, stepCache.current, stepCache.current)
            })
        }
        return () => {
            chart?.off('click')
        }
    }, [chart])
   

    const [timeline, names, data] = useMemo(() =>{
        const names = props.data.columns.slice(1)
       
        
        const data = []
        props.data.columns.forEach((_, i) => {
            data.push(props.data.data.map(d => d[i]))
        })


        const timeBucks = data[0]
        timeBucksCache.current = timeBucks
        const start = Number(timeBucks[0])
        const step = Number(timeBucks[1]) - start
        stepCache.current = step
        const end = Number(timeBucks[timeBucks.length - 1])
        const timeFormat = getTimeFormatForChart(start * 1000, end * 1000, step - start )
        const timeline = timeBucks.map(t => dateTimeFormat(t * 1000, { format: timeFormat }))
        timelineCache.current = timeline
        

        return [timeline, names, data.slice(1)]
    },[props.data])



    const chartOptions = {
        animation: false,
        animationDuration: 500,
        tooltip: {
            show: true,
            trigger: 'axis',
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
            bottom: '35%',
            // padding: 0,
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
                fontSize:  10,
                // interval: 5
            },
         
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false,
            },
            show: 'true',
            splitNumber: 1,
            axisLabel: {
                fontSize: 11
            }
        },
        series: names.map((name, i) => {
            return ({
            name: name,
            data: data[i],
            type: 'bar',
            stack: "total",
            label: {
                show: false,
                formatter: (v) => {
                    v.data + " lines"
                },
                fontSize: 11,
            },
            // emphasis: {
            //     focus: 'series'
            // },
            color: name == "others" ? useColorModeValue(colors1[0], 'rgb(80,250,123)') : customColors.error.light
            // barWidth: '90%'
        })})
    };

    return (<>
        <Text textStyle="annotation" mb="2" fontSize="0.7rem" fontWeight={500}>{displayLogs} / {totalLogs} Results </Text>
        <ChartComponent key={colorMode} options={chartOptions} clearWhenSetOption theme={colorMode} onChartCreated={c => setChart(c)} width={width} />
    </>)
})

export default DatavLogChart

