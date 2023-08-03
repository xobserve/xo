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

const barWidth = 100
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

        // console.log("here333333:",dateTimeFormat(start), dateTimeFormat(end))
        const now = new Date()
        const isInToday =  moment(start).isSame(now, 'day')
        const barCount = Math.min(maxTicks, Math.floor(width / barWidth))
        const step = Math.floor((end - start) / barCount)
        for (let i = 1; i < barCount; i++) {
            // 
            timeline.push(start + i * step)
        }
        
        const labelMap = new Map()
        for (const log of props.data) {
            let ts; 
            const timestamp = round(Number(log.timestamp) / 1e6)
            for (var i = 0; i <= timeline.length - 1 ; i ++) {
                if (timestamp <= timeline[i] ) {
                    ts = timeline[i]
                    break
                }
            }
            
            if (!ts) {
                ts = last(timeline)
            }
            console.log("here3444433:", log,timestamp,ts)
            for (const k of Object.keys(log.labels)) {
                const labelId = formatLabelId(k,log.labels[k])
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
        console.log("here333333:",timeline, names, data)  
        return [timeline.map(t =>  dateTimeFormat(t, {format: isInToday ? "HH:mm:ss" : "MM-DD HH:mm:ss"})), names, data]
    },[props.data])

    const options = {
        tooltip: {
            trigger: 'axis',
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
                    align:'left',
                    baseline:'middle',
                },
            },
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false,
            },
            show: true,
            splitNumber: 3,
        },
        series: names.map((name,i) => (  {   
            name: name,
            data: data[i],
            type: 'bar',
            stack: 'total',
            label: {
              show: true
            },
            emphasis: {
                focus: 'series'
              },
              barWidth: '80%'
        })) 
    };

    return (<>
        <ChartComponent key={colorMode}  options={options} theme={colorMode} onChartCreated={c => setChart(c)} width={width}/>
    </>)
}

export default LogChart