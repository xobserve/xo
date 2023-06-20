import { useEffect, useRef, useState } from "react"
import { useSearchParam } from "react-use"

import { Box } from "@chakra-ui/react";
import { echartsJS } from "src/views/dashboard/plugins/panel/echarts/Echarts";


interface Props {
    options: any
    theme: string
    width: number
    height: number
    onChartCreated: (chart) => void
    onChartEvents?: any
}


export const ChartComponent = ({ options, theme, width, height, onChartCreated, onChartEvents }: Props) => {
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
    
    options.animation = false

    useEffect(() => {
        if (container.current) {
            const c = echartsJS.init(container.current, theme)
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
        if (onChartEvents && chart) {
            onChartEvents(options, chart)
        }
    }, [onChartEvents])

    useEffect(() => {
        if (chart) {
            chart.resize({ width, height })
        }
    }, [width, height])
    return (<Box ref={container} width={width} height={height} className="echart-container" />)
}


export default ChartComponent