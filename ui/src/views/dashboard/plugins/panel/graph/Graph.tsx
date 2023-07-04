import UplotReact from "components/uPlot/UplotReact"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { OverrideItem, Panel, PanelProps } from "types/dashboard"
import 'uplot/dist/uPlot.min.css';
import uPlot from "uplot"

import { parseOptions } from './options';
import { cloneDeep, isEmpty } from "lodash";

import Tooltip from "./Tooltip";
import SeriesTable, { seriesTableMode } from "src/views/dashboard/plugins/panel/graph/Tooltip/SeriesTable";
import { GraphLayout } from "src/views/dashboard/plugins/panel/graph/GraphLayout";
import { Box, Center, Text, useColorMode } from "@chakra-ui/react";
import { colors } from "utils/colors";
import { SeriesData } from "types/seriesData";
import storage from "utils/localStorage";
import { PanelInactiveKey } from "src/data/storage-keys";
import useBus from "use-bus";
import { ActiveSeriesEvent } from "src/data/bus-events";


interface GraphPanelProps extends PanelProps {
    data: SeriesData[][]
}

const GraphPanel = memo((props: GraphPanelProps) => {
    const inactiveKey = PanelInactiveKey + props.dashboardId + '-' + props.panel.id
    const [inactiveSeries, setInactiveSeries] = useState(storage.get(inactiveKey) ?? [])
    const [uplot, setUplot] = useState<uPlot>(null)
    const { colorMode } = useColorMode()

    useEffect(() => {
        if (inactiveSeries.length > 0) {
            storage.set(inactiveKey, inactiveSeries)
        } else {
            storage.remove(inactiveKey)
        }
    }, [inactiveSeries])



    const data = useMemo(() => {
        const res = []
        props.data.forEach(d => {
            d.forEach(d1 => {
                res.push(d1)
            })
        })
        return res
    }, [props.data])




    const options = useMemo(() => {
        let o;
        data.map((frame, i) => {
            const override: OverrideItem = props.panel.overrides.find((o) => o.target == frame.rawName)
            const name = override?.overrides.find((o) => o.type == "Series.name")?.value
            console.log("here33333 name:",name)
            if (name) {
                frame.name = name
            } else {
                frame.name = frame.rawName
            }

            const color = override?.overrides.find((o) => o.type == "Series.color")?.value
            if (color) {
                frame.color = color
            } else {
                frame.color = colors[i % colors.length]
            }

            // const negativeY = override?.overrides.find(o => o.type == 'Series.negativeY')
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
    }, [props.panel, props.data, colorMode])


    const onSelectSeries = useCallback((s, i, pressShift) => {
        if (!pressShift) { // 未按住 shift
            if (inactiveSeries.length == 0) {
                // 也没有隐藏的 series: 只显示 s, 隐藏其它
                const inactive = []
                options.series.map((s1, j) => {
                    if (s1.label != s) {
                        inactive.push(s1.label)
                    }
                })
                setInactiveSeries(inactive)
                options.series.map((s1, j) => {
                    if (s1.label == s) {
                        uplot.setSeries(j, { show: true })
                    } else {
                        uplot.setSeries(j, { show: false })
                    }
                })
            } else {
                // 已经有 series 被隐藏
                if (inactiveSeries.includes(s)) {
                    //  s 处于隐藏状态，点击它，显示它，并隐藏其它
                    const inactive = []
                    options.series.map((s1, j) => {
                        if (s1.label != s) {
                            inactive.push(s1.label)
                        }
                    })
                    setInactiveSeries(inactive)
                    options.series.map((s1, j) => {
                        if (s1.label == s) {
                            uplot.setSeries(j, { show: true })
                        } else {
                            uplot.setSeries(j, { show: false })
                        }
                    })
                } else {
                    // s 目前处于显示状态，再次点击它，显示所有
                    setInactiveSeries([])
                    options.series.map((s1, j) => {
                        // s1.show = true
                        uplot.setSeries(j, { show: true })
                    })

                }
            }
        } else {
            // 按住 shift
            if (inactiveSeries.includes(s)) {
                // s 处于隐藏状态，点击它，显示它
                const inactive = inactiveSeries.filter(s1 => s1 != s)
                setInactiveSeries(inactive)
                options.series.map((s1, j) => {
                    if (s1.label == s) {
                        uplot.setSeries(j, { show: true })
                    }
                })
            } else {
                // s 处于显示状态，点击它，隐藏它
                const inactive = [...inactiveSeries]
                inactive.push(s)
                setInactiveSeries(inactive)
                options.series.map((s1, j) => {
                    if (s1.label == s) {
                        uplot.setSeries(j, { show: false })
                    }
                })
            }
        }

    }, [uplot, options.series, inactiveSeries])


    const onChartCreate = useCallback((chart) => { setUplot((chart)); props.sync?.sub(chart) }, [props.sync])

    return (
        <>{
            isEmpty(props.data) ? <Center height="100%">No data</Center> :

                <Box h="100%" className="panel-graph">
                    {!isEmpty(props?.panel.plugins.graph.axis?.label) && <Text fontSize="sm" position="absolute" ml="3" mt="-1" className="color-text">{props.panel.plugins.graph.axis.label}</Text>}
                    {options && <GraphLayout width={props.width} height={props.height} legend={props.panel.plugins.graph.legend.mode == "hidden" ? null : <SeriesTable placement={props.panel.plugins.graph.legend.placement} width={props.panel.plugins.graph.legend.width} props={props} data={data} mode={seriesTableMode.Legend} onSelect={onSelectSeries} panelType={props.panel.type} inactiveSeries={inactiveSeries} />}>
                        {(vizWidth: number, vizHeight: number) => {
                            if (uplot) {
                                if (props.width != vizWidth || props.height != vizHeight) {
                                    uplot.setSize({ width: vizWidth, height: vizHeight })
                                }
                            }

                            options.width = vizWidth
                            options.height = vizHeight
                            return (options && <UplotReact
                                options={options}
                                data={transformDataToUplot(data, props.panel)}
                                onDelete={(chart: uPlot) => { }}
                                onCreate={onChartCreate}
                            >
                                {props.panel.plugins.graph.tooltip.mode != 'hidden' && <Tooltip props={props} options={options} data={data} inactiveSeries={inactiveSeries} />}
                            </UplotReact>
                            )
                        }}



                    </GraphLayout>}
                </Box>}
        </>
    )
})

export default GraphPanel


const transformDataToUplot = (data: SeriesData[], panel: Panel) => {
    const transformed = []

    // push x-axes data first
    if (isEmpty(data)) {
        return []
    }

    const xField = data[0].fields[0]
    transformed.push(xField.values)

    // push y-axes series data
    for (const d of data) {
        const override: OverrideItem = panel.overrides.find((o) => o.target == d.rawName)
        const negativeY = override?.overrides.find(o => o.type == 'Series.negativeY')
        if (negativeY) {
            const vals = cloneDeep(d.fields[1].values)
            for (let i = 0; i < vals.length; i++) {
                if (vals[i] != null) {
                    vals[i] *= -1;
                }
            }
            transformed.push(vals)
        } else {
            transformed.push(d.fields[1].values)
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