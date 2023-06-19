import { ECharts } from "echarts"
import * as echarts from 'echarts';
import { useEffect, useRef, useState } from "react"
import { PanelProps } from "types/dashboard";
import { Box, useColorMode } from "@chakra-ui/react";



const EchartsPanel = ({data,width,height}: PanelProps) => {
    const { colorMode } = useColorMode()

    const options = data[0]
    return (<>
        <Box height="100%"  key={colorMode}><EchartsComponent options={options} theme={colorMode} width={width} height={height} /></Box>
    </>)
}

export default EchartsPanel

interface Props {
    options: any
    theme: string
    width: number 
    height: number
}

export const EchartsComponent = ({ options, theme, width, height }: Props) => {
    const container = useRef(null)
    const [chart, setChart] = useState<ECharts>(null)

    if (theme == "dark") {
        options.backgroundColor = "transparent"
    }

    useEffect(() => {
        if (container.current) {
            const c = echarts.init(container.current, theme)
            setChart(c)
            console.log("333333 set options :", options)
            c.setOption(options)
            console.log("create echart instance:", c)
        }

        return () => {
            if (chart) {
                console.log("destroy chart")
                chart?.dispose()
                chart?.clear()
            }
        }
    }, [])

    useEffect(() => {
        if (chart) {
            chart.setOption(options)
        }

        console.log("333333 update options :", options)
    }, [options])

 
    useEffect(() => {
        if (chart) {
            chart.resize({width,height})
        }
    },[width, height])
    return (<Box ref={container} height="100%" />)
}

