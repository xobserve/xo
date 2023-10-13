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
import UplotReact from "src/components/uPlot/UplotReact"
import { memo, useCallback, useMemo, useRef, useState } from "react"
import { OverrideItem, Panel, PanelProps } from "types/dashboard"
import 'uplot/dist/uPlot.min.css';
import uPlot from "uplot"

import { parseOptions } from './options';
import { cloneDeep, isEmpty } from "lodash";

import Tooltip from "./Tooltip";
import { GraphLayout } from "src/views/dashboard/plugins/built-in/panel/graph/GraphLayout";
import { Box, Center, Text, useColorMode } from "@chakra-ui/react";
import { paletteColorNameToHex, paletteMap, palettes } from "utils/colors";
import { FieldType, SeriesData } from "types/seriesData";
import storage from "utils/localStorage";
import { PanelInactiveKey } from "src/data/storage-keys";
import { ZoomPlugin } from "./uplot-plugins/ZoomPlugin";
import { setDateTime } from "src/components/DatePicker/DatePicker";
import React from "react";
import { GraphRules } from "./OverridesEditor";
import { findOverride, findOverrideRule, findRuleInOverride } from "utils/dashboard/panel";
import { ThresholdsPlugin } from "./uplot-plugins/ThresholdsPlugin";
import { ThresholdDisplay } from "types/panel/plugins";
import { getStackedOpts } from "./uplot-plugins/stack";
import { isSeriesData } from "utils/seriesData";
import ContextMenu from "./ContextMenu/ContextMenu";
import { AnnotationsPlugin } from "../../../../../Annotation/Annotations";
import NoData from "src/views/dashboard/components/PanelNoData";
import LegendTable from "../../../components/Legend";

interface GraphPanelProps extends PanelProps {
    data: SeriesData[][]
}



const GraphPanelWrapper = (props: GraphPanelProps) => {
    if (isEmpty(props.data)) {
        return <Center height="100%"><NoData /></Center>
    }

    if (!isSeriesData(props.data)) {
        return (<Center height="100%">Data format not support!</Center>)
    }

    return (<>
        <GraphPanel {...props} />
    </>
    )
}

export default GraphPanelWrapper

const GraphPanel = memo((props: GraphPanelProps) => {
    const inactiveKey = PanelInactiveKey + props.dashboardId + '-' + props.panel.id
    const [inactiveSeries, setInactiveSeries] = useState(storage.get(inactiveKey) ?? [])

    const [uplot, setUplot] = useState<uPlot>(null)
    const { colorMode } = useColorMode()
    const containerRef = useRef()
    if (!isSeriesData(props.data)) {
        return (<Center height="100%">Data format not support!</Center>)
    }



    const data = useMemo(() => {
        const res = []
        props.data.forEach(d => {
            d.forEach(d1 => {
                d1.rawName = d1.name
                res.push(d1)
            })
        })
        return res
    }, [props.data])




    const options = useMemo(() => {
        let o;
        const colors = paletteMap[props.panel.styles.palette] ?? palettes
        data.map((frame, i) => {
            const override: OverrideItem = findOverride(props.panel, frame.rawName)
            const name = findRuleInOverride(override, GraphRules.SeriesName)
            if (name) {
                frame.name = name
            } else {
                frame.name = frame.rawName
            }


            let color = findRuleInOverride(override, GraphRules.SeriesColor)
            if (!color) {
                color = colors[i % colors.length]
            }
            frame.color = paletteColorNameToHex(color, colorMode)

            // const negativeY = override?.overrides.find(o => o.type ==  GraphRules.SeriesNegativeY)
            // if (negativeY) {
            //     const vals = frame.fields[1].values
            //     for (let i = 0; i < vals.length; i++) {
            //         if (vals[i] != null) {
            //             vals[i] *= -1;
            //         }
            //     }
            // }
        })

        o = parseOptions(props, data, colorMode, inactiveSeries)

        return o
    }, [props.panel, props.data, colorMode, inactiveSeries])


    const onSeriesActive = useCallback((inacitve) => {
        setInactiveSeries(inacitve)
    }, [])


    const onChartCreate = useCallback((chart) => {
        setUplot((chart));
        props.sync?.sub(chart);
    }, [props.sync])

    const onZoom = (tr) => {
        setDateTime(tr.from, tr.to)
    }


    return (
        <>{
            isEmpty(props.data) ? <Center height="100%">No data</Center> :

                <Box h="100%" className="panel-graph" ref={containerRef} position="relative">
                    {!isEmpty(props?.panel.plugins.graph.axis?.label) && <Text fontSize="sm" position="absolute" ml="3" mt="-1" className="color-text">{props.panel.plugins.graph.axis.label}</Text>}
                    {options && <GraphLayout
                        width={props.width}
                        height={props.height}
                        legend={props.panel.plugins.graph.legend.mode == "hidden" ? null :
                            <LegendTable
                                panel={props.panel}
                                panelWidth={props.width}
                                dashboardId={props.dashboardId}
                                options={
                                    {
                                        value: props.panel.plugins.graph.value,
                                        legend: props.panel.plugins.graph.legend
                                    }
                                }
                                placement={props.panel.plugins.graph.legend.placement}
                                width={props.panel.plugins.graph.legend.width}
                                data={data}
                                inactiveSeries={inactiveSeries}
                                onSeriesActive={onSeriesActive} />}
                    >
                        {(vizWidth: number, vizHeight: number) => {
                            if (uplot) {
                                if (props.width != vizWidth || props.height != vizHeight) {
                                    uplot.setSize({ width: vizWidth, height: vizHeight })
                                }
                            }

                            options.width = vizWidth
                            options.height = vizHeight

                            let plotOpts = options
                            let plotData = transformDataToUplot(data, props.panel)
                            console.log("here33333:",plotData)
                            if (props.panel.plugins.graph.styles.enableStack) {
                                const r = getStackedOpts(plotOpts, plotData, null);
                                plotData = r.data
                                plotOpts = r.opts
                            }

                            const thresholdsOverride = props.panel.overrides.find(override => findRuleInOverride(override, GraphRules.SeriesThresholds))
                            const v = findRuleInOverride(thresholdsOverride, GraphRules.SeriesThresholds)

                            return (options && <UplotReact
                                options={plotOpts}
                                data={plotData}
                                onDelete={(chart: uPlot) => { }}
                                onCreate={onChartCreate}
                            >
                                {props.panel.plugins.graph.tooltip.mode != 'hidden' && <Tooltip props={props} options={options} data={data} inactiveSeries={inactiveSeries} />}
                                <ContextMenu props={props} options={options} data={data} container={containerRef} />
                                <ZoomPlugin options={options} onZoom={onZoom} />
                                <AnnotationsPlugin dashboardId={props.dashboardId} options={options} timeRange={props.timeRange} panel={props.panel} />
                                {props.panel.plugins.graph.thresholdsDisplay != ThresholdDisplay.None && <ThresholdsPlugin options={options} thresholdsConfig={props.panel.plugins.graph.thresholds} display={props.panel.plugins.graph.thresholdsDisplay} />}
                                {v && props.panel.plugins.graph.thresholdsDisplay != ThresholdDisplay.None && <ThresholdsPlugin options={options} thresholdsConfig={v} display={props.panel.plugins.graph.thresholdsDisplay} />}
                            </UplotReact>
                            )
                        }}



                    </GraphLayout>}
                </Box>}
        </>
    )
})


const transformDataToUplot = (data: SeriesData[], panel: Panel) => {
    const transformed = []

    // push x-axes data first
    if (isEmpty(data)) {
        return []
    }

    const xField = data[0].fields.find(f => f.type == FieldType.Time)
    if (!xField) {
        return []
    }
    
    transformed.push(xField.values)

    // push y-axes series data
    for (const d of data) {
        const negativeY = findOverrideRule(panel, d.rawName, GraphRules.SeriesNegativeY)
        const values = d.fields.find(f => f.type != FieldType.Time).values
        if (negativeY) {
            const vals = cloneDeep(values)
            for (let i = 0; i < vals.length; i++) {
                if (vals[i] != null) {
                    vals[i] *= -1;
                }
            }
            transformed.push(vals)
        } else {
            transformed.push(values)
        }
    }

    return transformed
}


enum ScaleOrientation {
    Horizontal = 0,
    Vertical = 1,
}




export enum GradientDirection {
    Right = 0,
    Up = 1,
    Left = 2,
    Down = 3,
}
function makeDirectionalGradient(direction: GradientDirection, bbox: uPlot.BBox, ctx: CanvasRenderingContext2D) {
    let x0 = 0,
        y0 = 0,
        x1 = 0,
        y1 = 0;

    if (direction === GradientDirection.Down) {
        y0 = bbox.top;
        y1 = bbox.top + bbox.height;
    } else if (direction === GradientDirection.Left) {
        x0 = bbox.left + bbox.width;
        x1 = bbox.left;
    } else if (direction === GradientDirection.Up) {
        y0 = bbox.top + bbox.height;
        y1 = bbox.top;
    } else if (direction === GradientDirection.Right) {
        x0 = bbox.left;
        x1 = bbox.left + bbox.width;
    }

    return ctx.createLinearGradient(x0, y0, x1, y1);
}