import * as echarts from 'echarts/core';

// Import bar charts, all suffixed with Chart
import { BarChart, PieChart } from 'echarts/charts';

// Import the tooltip, title, rectangular coordinate system, dataset and transform components
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent
} from 'echarts/components';

// Features like Universal Transition and Label Layout
import { LabelLayout, UniversalTransition } from 'echarts/features';

// Import the Canvas renderer
// Note that including the CanvasRenderer or SVGRenderer is a required step
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useSearchParam } from 'react-use';
// Register the required components
echarts.use([
    BarChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
  ]);


interface Props {
    options: any
    theme: string
    width: number
    height: number
    onChartCreated: (chart) => void
    onChartEvents?: any
    darkBg?: string
}

export const PieChartComponent = ({ options, theme, width, height, onChartCreated, onChartEvents }: Props) => {
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
            const c = echarts.init(container.current, "dark")
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


export default PieChartComponent