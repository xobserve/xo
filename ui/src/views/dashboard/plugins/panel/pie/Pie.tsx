import { Box, useColorMode } from "@chakra-ui/react";
import ChartComponent from "components/charts/Chart";
import { useMemo, useState } from "react";
import { Panel, PanelProps } from "types/dashboard"
import { PieLegendPlacement } from "types/panel/plugins";
import { PiePluginData } from "types/plugins/pie"

interface Props extends PanelProps {
    data: PiePluginData[]
}

const PiePanel = ({ panel, data, height, width }: Props) => {
    const [chart, setChart] = useState(null)
    const { colorMode } = useColorMode()
    
    const options = useMemo(() =>  {
        const d = data.length > 0 ? data[0] : []
        const lp = parseLegendPlacement(panel)
        return {
            animation: panel.plugins.pie.animation,
            legend: {
                show: panel.plugins.pie.legend.show,
                orient: panel.plugins.pie.legend.orient,
                ...lp
            },
            tooltip: {
                trigger: 'item'
            },
            series: [
                {
                    type: 'pie',
                    radius: [`${panel.plugins.pie.shape.innerRadius}%`, `${panel.plugins.pie.shape.radius}%`],
                    center: ['50%', '50%'],
                    roseType: panel.plugins.pie.shape.type == "rose" ? "area" : null,
                    itemStyle: {
                        borderRadius: panel.plugins.pie.shape.borderRadius
                    },
                    data: d,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        show: panel.plugins.pie.showLabel
                    }
                }
            ]
        }
    },[panel.plugins.pie, data, colorMode])
    
    

    return (<>
        {options && <Box height={height} key={colorMode} className="echarts-panel"><ChartComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={c => setChart(c)} onChartEvents={null} /></Box>}
    </>)
}

export default PiePanel



const parseLegendPlacement = (panel: Panel) => {
    switch (panel.plugins.pie.legend.placement) {
        case PieLegendPlacement.Top:
            return {
                top: "top"
            }
        case PieLegendPlacement.Bottom:
            return {
                top: "bottom"
            }
        case PieLegendPlacement.TopLeft:
            return {
                top: "top",
                left: "left"
            }
        case PieLegendPlacement.TopLeft:
            return {
                top: "top",
                left: "left"
            }
        case PieLegendPlacement.TopRight:
            return {
                top: "top",
                left: "right"
            }
        case PieLegendPlacement.BottomLeft:
            return {
                top: "bottom",
                left: "left"
            }
        case PieLegendPlacement.BottomRight:
            return {
                top: "bottom",
                left: "right"
            }
    }
}