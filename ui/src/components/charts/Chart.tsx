import React from "react"
import { memo, useEffect, useRef, useState } from "react"
import { useSearchParam } from "react-use"
import * as echarts from 'echarts';
import { Box } from "@chakra-ui/react";


interface Props {
    options: any
    theme: string
    width?: number
    height: number
    onChartCreated: (chart) => void
    onChartEvents?: any
}


export const ChartComponent = memo(({ options, theme, width, height, onChartCreated, onChartEvents }: Props) => {
    const edit = useSearchParam('edit')
    const container = useRef(null)
    const [chart, setChart] = useState(null)

    if (theme == "dark") {
        if (edit) {
            options.backgroundColor = "transparent"
        } else {
            options.backgroundColor = "#1A202C"
        }
    }
    
    useEffect(() => {
        if (container.current) {
            const c = echarts.init(container.current, theme)
            setChart(c)
            c.setOption(options)
            onChartCreated(c)
            registerEvents(c)
        }

        return () => {
            if (chart) {
                chart?.dispose()
                chart?.clear()
                chart.off('click')
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
        if (onChartEvents && chart) {
            registerEvents()
        }
    }, [onChartEvents])

    useEffect(() => {
        if (chart) {
            chart.resize({ width, height })
        }
    }, [width, height])

    const registerEvents = (c?) => {
        const ct = c ?? chart
        ct.off('click')
        ct.on('click', onChartEvents)
    }
    return (<Box ref={container} width={width} height={height} className="echart-container" />)
})


export default ChartComponent