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
import { round } from "lodash"
import React, { useMemo, useState } from "react"
import { Panel } from "types/dashboard"
import { Log } from "types/plugins/log"
import { dateTimeFormat } from "utils/datetime/formatter"

interface Props {
    data: Log[]
    panel: Panel
    width: number
}

const barWidth = 150
const maxTicks = 10
const LogChart = (props: Props) => {
    const { panel, width } = props
    const [chart, setChart] = useState(null)
    const { colorMode } = useColorMode()
    const [timeline, names, data] = useMemo(() => {
        const timeline = []
        const names = []
        const data = []
        const timeRange = getCurrentTimeRange()
        const start = round(timeRange.start.getTime())
        const end = round(timeRange.end.getTime())
        const isStarEndSameDay = timeRange.start.getDate() == timeRange.end.getDate()
        const barCount = Math.min(maxTicks, Math.floor(width / barWidth))
        const step = Math.floor((end - start) / barCount)
        for (let i = 0; i <= barCount; i++) {
            const s = dateTimeFormat(start + i * step, {format: isStarEndSameDay ? "HH:mm:ss" : "MM-DD HH:mm:ss"})
            timeline.push(s)
        }
        
        return [timeline, names, data]
    },[props.data])

    const options = {
        tooltip: {
            trigger: 'axis',
          },
        grid: {
            left: "4%",
            right: "3%",
            top: "6%",
            bottom: '16%',
            padding: 0,
        },
        xAxis: {
            type: 'category',
            data: timeline,
            show: true,
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false,
            },
            show: false,
            splitNumber: 3,
        },
        series: [
            {   
                name: "test1",
                data: [120, 200, 150, 80, 70, 110, 130],
                type: 'bar',
                stack: 'total',
                label: {
                  show: true
                },
                emphasis: {
                    focus: 'series'
                  },
            },
            {
                name: "test2",
                data: [220, 100, 50, 80, 70, 70, 30],
                type: 'bar',
                stack: 'total',
                label: {
                  show: true
                },
                emphasis: {
                    focus: 'series'
                  },
            }
        ]
    };

    return (<>
        <ChartComponent key={colorMode}  options={options} theme={colorMode} onChartCreated={c => setChart(c)} width={width}/>
    </>)
}

export default LogChart