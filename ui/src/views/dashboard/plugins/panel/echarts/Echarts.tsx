import { ECharts } from "echarts"
import * as echarts from 'echarts';
import { useEffect, useMemo, useRef, useState } from "react"
import { PanelProps } from "types/dashboard";
import { Box, Center, useColorMode, useToast } from "@chakra-ui/react";
import { genDynamicFunction } from "utils/dynamicCode";
import {  cloneDeep, isEmpty, isFunction } from "lodash";
import { useSearchParam } from "react-use";
import { dispatch } from "use-bus";
import { PanelDataEvent } from "src/data/bus-events";



const EchartsPanel = ({ panel, data, width, height }: PanelProps) => {
    if (!panel.plugins.echarts.allowEmptyData && isEmpty(data)) {
        return (<Center height="100%">No data</Center>)
    }

    const { colorMode } = useColorMode()
    const toast = useToast()
    const [chart, setChart] = useState<ECharts>(null)
    const edit = useSearchParam("edit")

    useEffect(() => {
        if (edit == panel.id.toString()) {
            dispatch({ type: PanelDataEvent, data: data })
        }
    }, [data])
    const [options, onEvents] = useMemo(() => {
        let options = null;
        let onEvents = null;
        const setOptions = genDynamicFunction(panel.plugins.echarts.setOptionsFunc);
        if (isFunction(setOptions)) {
            const o = setOptions(cloneDeep(data), echarts)
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



        return [options, onEvents]
    }, [panel.plugins.echarts, data, chart])

    // override  echarts background in panel edit mod
    const darkBg = edit == panel.id.toString() ? 'transparent' : "#1A202C"
    return (<>
        {options && <Box height={height} key={colorMode} className="echarts-panel"><EchartsComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={c => setChart(c)} onChartEvents={onEvents} darkBg={darkBg} /></Box>}
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
    darkBg?: string
}

export const EchartsComponent = ({ options, theme, width, height, onChartCreated, onChartEvents, darkBg }: Props) => {
    const container = useRef(null)
    const toast = useToast()
    const [chart, setChart] = useState<ECharts>(null)

    if (theme == "dark" && darkBg) {
        options.backgroundColor = darkBg
    }

    options.animation = false

    useEffect(() => {
        if (container.current) {
            const c = echarts.init(container.current, theme)
            setChart(c)
            tryCatchCall(() => c.setOption(options), toast)
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
            tryCatchCall(() => chart.setOption(options), toast)
        }
    }, [options])

    useEffect(() => {
        if (onChartEvents && chart) {
            onChartEvents(options, chart)
        }
    }, [onChartEvents])

    useEffect(() => {
        if (chart) {
            tryCatchCall(() => chart.resize({ width, height }), toast)
        }
    }, [width, height])
    return (<Box ref={container} width={width} height={height} className="echart-container" />)
}


const tryCatchCall = (f, toast) => {
    const id = "echarts-error"
    try {
        f()
    } catch (error) {
        if (!toast.isActive(id)) {
            toast({
                id: id,
                title: `running echarts panel error: ${error.message}`,
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
        }
    }
}