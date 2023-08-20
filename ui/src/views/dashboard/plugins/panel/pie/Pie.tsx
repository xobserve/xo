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
import { Box, Center, useColorMode } from "@chakra-ui/react";
import ChartComponent from "components/charts/Chart";
import { formatUnit } from "components/Unit";
import { memo, useMemo, useState } from "react";
import { Panel, PanelProps } from "types/dashboard"
import { PieLegendPlacement } from "types/panel/plugins";
import { PiePluginData } from "types/plugins/pie"
import { SeriesData } from "types/seriesData";
import { commonInteractionEvent, genDynamicFunction } from "utils/dashboard/dynamicCall";
import { calcValueOnSeriesData, isSeriesData } from "utils/seriesData";
import React from "react";
import { paletteColorNameToHex } from "utils/colors";
import { ValueCalculationType } from "types/value";
import { getThreshold } from "components/Threshold/utils";
import { ThresholdsMode } from "types/threshold";
import { isEmpty } from "utils/validate";
import { useNavigate } from "react-router-dom";
import { isFunction } from "lodash";

interface Props extends PanelProps {
    data: SeriesData[][]
}

const PiePanelWrapper = memo((props: Props) => {
    if (isEmpty(props.data)) {
        return <Center height="100%">No data</Center>
    }

    if (!isSeriesData(props.data)) {
        return (<Center height="100%">Data format not support!</Center>)
    }

    return (<>
        <PiePanel {...props} />
    </>
    )
})

export default PiePanelWrapper

const PiePanel = (props: Props) => {
    const { panel, height, width } = props
    const [chart, setChart] = useState(null)
    const { colorMode } = useColorMode()
    const navigate = useNavigate()
    if (!isSeriesData(props.data)) {
        return (<Center height="100%">Data format not support!</Center>)
    }

    const [options, onEvents] = useMemo(() => {
        // const d = data.length > 0 ? data[0] : []

        const data: PiePluginData = []
        const color = []
        for (const s of props.data) {
            for (const series of s) {
                const v = calcValueOnSeriesData(series, props.panel.plugins.pie.value.calc)
                data.push({
                    name: series.name,
                    value: v,
                })

                if (panel.plugins.pie.enableThresholds) {
                    let max = 0
                    if (panel.plugins.pie.thresholds.mode == ThresholdsMode.Percentage) {
                        max = calcValueOnSeriesData(series, ValueCalculationType.Max)
                    }
                    const threshold = getThreshold(v, panel.plugins.pie.thresholds, max)
                    if (threshold) {
                        color.push(paletteColorNameToHex(threshold.color))
                    }
                }
            }
        }

        const onEvents = genDynamicFunction(panel.plugins.pie.onClickEvent);



        const lp = parseLegendPlacement(panel)

       

        const transformLabel = genDynamicFunction(panel.plugins.pie.label.transformName);
        return [{
            animation: panel.plugins.pie.animation,
            legend: {
                show: panel.plugins.pie.legend.show,
                orient: panel.plugins.pie.legend.orient,
                ...lp
            },
            tooltip: {
                trigger: 'item',
                formatter: item => {
                    return `${formatUnit(item.value, panel.plugins.pie.value.units, panel.plugins.pie.value.decimal)}`
                },
            },
            series: [
                {
                    type: 'pie',
                    radius: [`${panel.plugins.pie.shape.innerRadius}%`, `${panel.plugins.pie.shape.radius}%`],
                    center: ['50%', '50%'],
                    roseType: panel.plugins.pie.shape.type == "rose" ? "area" : null,
                    itemStyle: {
                        borderRadius: panel.plugins.pie.shape.borderRadius,
                        opacity: 0.7,
                        borderWidth: colorMode == "light" ? 0.5 : 0.5,
                        borderColor: color.length > 0 && panel.plugins.pie.showThreshodBorder ? true : null
                    },
                    data: data,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        show: panel.plugins.pie.label.show,
                        alignTo: panel.plugins.pie.label.align,
                        minMargin: panel.plugins.pie.label.margin,
                        edgeDistance: 1,
                        opacity: 1,
                        formatter: params => {
                            let labelFormater = ''
                            if (panel.plugins.pie.label.showName) {
                                if (isFunction(transformLabel)) {
                                    labelFormater += transformLabel(params.data.name, params)
                                } else {
                                    labelFormater += params.data.name
                                }
                              
                            }
                            if (panel.plugins.pie.label.showValue) {
                                if (!isEmpty(labelFormater)) {
                                    labelFormater += '\n'
                                }
                                
                                labelFormater += formatUnit(params.data.value, panel.plugins.pie.value.units, panel.plugins.pie.value.decimal)
                            }

                            return labelFormater
                        },
                        lineHeight: panel.plugins.pie.label.lineHeight,
                        fontSize: panel.plugins.pie.label.fontSize,
                    },
                    labelLayout: panel.plugins.pie.label.show && panel.plugins.pie.label.showName && panel.plugins.pie.label.showValue &&  ( function (params) {
                        const isLeft = params.labelRect.x < chart?.getWidth() / 2;
                        const points = params.labelLinePoints;
                        // Update the end point.
                        points[2][0] = isLeft
                            ? params.labelRect.x
                            : params.labelRect.x + params.labelRect.width;
                        return {
                            labelLinePoints: points
                        };
                    }),
                    color: color,
                }
            ]
        }, onEvents]
    }, [panel.plugins.pie, props.data, colorMode, chart])



    return (<>
        {options && <Box height={height} key={colorMode} className="echarts-panel"><ChartComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={c => setChart(c)} onChartEvents={(row) => commonInteractionEvent(onEvents, row)} /></Box>}
    </>)
}




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