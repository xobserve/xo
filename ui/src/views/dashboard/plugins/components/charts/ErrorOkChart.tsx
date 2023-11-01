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

import { Switch, Text, useColorMode, useColorModeValue } from "@chakra-ui/react"
import ChartComponent from "src/components/charts/Chart"
import React, { memo, useEffect, useMemo, useRef, useState } from "react"
import { Panel } from "types/dashboard"

import { QueryPluginData } from "types/plugin"
import { dateTimeFormat } from "utils/datetime/formatter"
import { getTimeFormatForChart } from "utils/format"
import customColors from "theme/colors"
import {colors1} from 'utils/colors'
import { useStore } from "@nanostores/react"
import { locale } from "src/i18n/i18n"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import RadionButtons from "components/RadioButtons"
import { EditorNumberItem } from "components/editor/EditorItem"
import { dispatch } from "use-bus"
import { PanelForceRebuildEvent } from "src/data/bus-events"

interface Props {
    data: QueryPluginData
    onClick: any
    totalCount: number
    displayCount: number
    options: any
}

const ErrorOkChart = memo((props: Props) => {
    const {  onClick, totalCount, displayCount,options } = props
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
            left: `${options}%`,
            right: `${options.right}%`,
            top: `${options.top}%`,
            bottom: `${options.bottom}%`,
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
            type: options.type,
            stack: options.stack,
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
            color: name != "errors" ? useColorModeValue(colors1[0], 'rgb(80,250,123)') : customColors.error.light
            // barWidth: '90%'
        })})
    };

    return (<>
        <Text opacity={0.8} mb="2" fontSize="0.8rem" fontWeight={500}>{displayCount && (displayCount + ' Results / ')}  {totalCount} Hits </Text>
        <ChartComponent key={colorMode} options={chartOptions} clearWhenSetOption theme={colorMode} onChartCreated={c => setChart(c)} />
    </>)
})

export default ErrorOkChart


export const ErrorOkChartEditor = ({panel,panelType,onChange }) => {
    const lang = useStore(locale)
    return (
        <PanelAccordion title={"Chart"}>
        <PanelEditItem title={lang == "en" ? "Type" : "图表类型"}>
            <RadionButtons options={[{ label: "Bar", value: "bar" }, { label: "Line", value: "line" }]} value={panel.plugins[panelType].chart.type} onChange={v => onChange((panel: Panel) => {
                panel.plugins[panelType].chart.type = v
            })} />
        </PanelEditItem>
        <PanelEditItem title={lang == "en" ? "Height" : "图表高度"}>
            <EditorNumberItem value={panel.plugins[panelType].chart.height} onChange={v => onChange((panel: Panel) => {
                panel.plugins[panelType].chart.height = v
                dispatch(PanelForceRebuildEvent + panel.id)
            })} step={10} min={0} max={1000} />
        </PanelEditItem>
        <PanelEditItem title={"Stack"}>
            <Switch defaultChecked={panel.plugins[panelType].chart.stack} onChange={e => onChange((panel: Panel) => {
                panel.plugins[panelType].chart.stack = e.currentTarget.checked
            })} />
        </PanelEditItem>
        <PanelEditItem title={"Top"}>
            <EditorNumberItem value={panel.plugins[panelType].chart.top} onChange={v => onChange((panel: Panel) => {
                panel.plugins[panelType].chart.top = v
            })} step={1} min={0} max={100} /> %
        </PanelEditItem>
        <PanelEditItem title={"Right"}>
            <EditorNumberItem value={panel.plugins[panelType].chart.right} onChange={v => onChange((panel: Panel) => {
                panel.plugins[panelType].chart.right = v
            })} step={1} min={0} max={100} /> %
        </PanelEditItem>
        <PanelEditItem title={"Bottom"}>
            <EditorNumberItem value={panel.plugins[panelType].chart.bottom} onChange={v => onChange((panel: Panel) => {
                panel.plugins[panelType].chart.bottom = v
            })} step={1} min={0} max={100} /> %
        </PanelEditItem>
        <PanelEditItem title={"Left"}>
            <EditorNumberItem value={panel.plugins[panelType].chart.left} onChange={v => onChange((panel: Panel) => {
                panel.plugins[panelType].chart.left = v
            })} step={1} min={0} max={100} /> %
        </PanelEditItem>
    </PanelAccordion>
    )
}