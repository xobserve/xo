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
import { Box, useColorMode, useToast } from "@chakra-ui/react";
import ChartComponent from "components/charts/Chart";
import { formatUnit } from "components/Unit";
import { isFunction, round } from "lodash";
import { useMemo, useState } from "react";
import { Panel, PanelProps } from "types/dashboard"
import { PieLegendPlacement } from "types/panel/plugins";
import { PiePluginData } from "types/plugins/pie"
import { SeriesData } from "types/seriesData";
import { genDynamicFunction } from "utils/dynamicCode";
import { calcValueOnSeriesData } from "utils/seriesData";
import React from "react";
import { colors, paletteColorNameToHex } from "utils/colors";
import { ValueCalculationType } from "types/value";
import { getThreshold } from "components/Threshold/utils";
import { ThresholdsMode } from "types/threshold";

interface Props extends PanelProps {
    data: SeriesData[][]
}

const PiePanel = (props: Props) => {
    const { panel, height, width } = props
    const [chart, setChart] = useState(null)
    const { colorMode } = useColorMode()

    const [options, onEvents] = useMemo(() => {
        // const d = data.length > 0 ? data[0] : []

        const data: PiePluginData = []
        const colors = []
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
                        colors.push(paletteColorNameToHex(threshold.color))
                    }
                }
            }
        }

        const onEvents = genDynamicFunction(panel.plugins.pie.onClickEvent);



        const lp = parseLegendPlacement(panel)


        return [{
            // color: colors,
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
                        borderRadius: panel.plugins.pie.shape.borderRadius
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
                        show: panel.plugins.pie.showLabel,
                    },
                    color: colors
                }
            ]
        }, onEvents]
    }, [panel.plugins.pie, props.data, colorMode])



    return (<>
        {options && <Box height={height} key={colorMode} className="echarts-panel"><ChartComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={c => setChart(c)} onChartEvents={onEvents} /></Box>}
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