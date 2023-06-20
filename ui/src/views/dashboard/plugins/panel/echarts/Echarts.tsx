import { ECharts } from "echarts"
import * as echarts from 'echarts';
import { useEffect, useMemo, useRef, useState } from "react"
import { PanelProps } from "types/dashboard";
import { Box, useColorMode, useToast } from "@chakra-ui/react";
import { genDynamicFunction } from "utils/dynamicCode";
import { clone, isFunction } from "lodash";
import { useSearchParam } from "react-use";
import { dispatch } from "use-bus";
import { PanelDataEvent } from "src/data/bus-events";



const EchartsPanel = ({ panel, data, width, height }: PanelProps) => {
    const { colorMode } = useColorMode()
    const toast = useToast()
    const [chart, setChart] = useState<ECharts>(null)
    const edit = useSearchParam("edit")
    useEffect(() => {
        if (edit==panel.id.toString()) {
            dispatch({ type: PanelDataEvent, data: data })
        }
    },[data])
    const [options,onEvents] = useMemo(() => {
        let options = null;
        let onEvents = null;
        const setOptions = genDynamicFunction(panel.plugins.echarts.setOptionsFunc);
        if (isFunction(setOptions)) {
            const o = setOptions(clone(data[0]), echarts)
            options = o
        } else {
            toast({
                title: "set options error",
                description: "The setOptions function you defined is not valid",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        }

        if (chart) {
            const registerEvents = genDynamicFunction(panel.plugins.echarts.registerEventsFunc);
            if (isFunction(registerEvents)) {
                onEvents = registerEvents
            } else {
                toast({
                    title: "register events error",
                    description: "The registerEvents function you defined is not valid",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                })
            }
        }

      

        return [options,onEvents]
    }, [panel.plugins.echarts, data, chart])

    return (<>
        {options && <Box height="100%" key={colorMode}><EchartsComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={c => setChart(c)} onChartEvents={onEvents} /></Box>}
    </>)
}

export default EchartsPanel

interface Props {
    options: any
    theme: string
    width: number
    height: number
    onChartCreated: (chart: ECharts) => void
    onChartEvents?: any
}

export const EchartsComponent = ({ options, theme, width, height, onChartCreated, onChartEvents }: Props) => {
    const container = useRef(null)
    const [chart, setChart] = useState<ECharts>(null)
    
    if (theme == "dark") {
        options.backgroundColor = "transparent"
    }
    options.animation = false

    useEffect(() => {
        if (container.current) {
            const c = echarts.init(container.current, theme)
            setChart(c)
            c.setOption(options)
            onChartCreated(c)
        }

        return () => {
            if (chart) {
                chart?.dispose()
                chart?.clear()
            }
        }
    }, [])
    
    useEffect(() => {
        if (chart) {
            chart.clear()
            chart.setOption(options)
        }
    }, [options])

    useEffect(() => {
        if (onChartEvents) {
            onChartEvents(options, chart)
        }
    },[onChartEvents])

    useEffect(() => {
        if (chart) {
            chart.resize({ width, height })
        }
    }, [width, height])
    return (<Box ref={container} width={width} height={height} />)
}

