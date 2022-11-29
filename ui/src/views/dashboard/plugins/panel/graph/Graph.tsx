import UplotReact from "components/uPlot/UplotReact"
import { memo, useCallback, useMemo, useRef, useState } from "react"
import { PanelProps } from "types/dashboard"
import 'uplot/dist/uPlot.min.css';
import uPlot from "uplot"

import { parseOptions } from './options';
import { DataFrame } from "types/dataFrame";
import { isEmpty } from "lodash";

import Tooltip from "./Tooltip";
import SeriesTable, { seriesFilterType } from "components/Tooltip/SeriesTable";
import { GraphLayout } from "layouts/plugins/GraphLayout";
import { Box,  Text, useColorMode } from "@chakra-ui/react";
import { colors } from "utils/colors";
import { parseLegendFormat } from "utils/format";
import { replaceWithVariables } from "utils/variable";
import { variables } from "src/views/dashboard/Dashboard";
import { dispatch } from "use-bus";
import { ActiveSeriesEvent } from "src/data/bus-events";




const GraphPanel = memo((props: PanelProps) => {
    const {colorMode} = useColorMode()
    const activeSeries = useRef(null)
    const [options, data] = useMemo(() => {
        let o;
        let activeExist = false
        // transform series name based on legend format 
        for (const ds of props.panel.datasource) {
            if (ds.selected) {
                for (const query of ds.queries) {
                    if (!isEmpty(query.legend)) {
                        const formats = parseLegendFormat(query.legend)
              
                        props.data.map(frame => {
                            if (frame.id == query.id) {
                                frame.name = query.legend
                                if (!isEmpty(formats)) {
                                    for (const format of formats) {
                                        const l = frame.fields[1].labels[format]
                                        if (l) {
                                            frame.name = frame.name.replaceAll(`{{${format}}}`, l)
                                        }
                                    }
                                }

                                // replace ${xxx} format with corresponding variables
                                frame.name = replaceWithVariables(frame.name, variables)
                            }
                        })
                    }
                }
            }



            // set series line color
            props.data.map((frame, i) => {
                frame.color = colors[i % colors.length]
                if (frame.name == activeSeries.current) {
                    activeExist =true
                }
            })

            if (!activeExist) {
                activeSeries.current = null
                dispatch({type:  ActiveSeriesEvent, id: props.panel.id, data: null})
            } 
            o = parseOptions(props, colorMode,activeSeries.current)
        }

        return [o, transformDataToUplot(props.data)]
    }, [props.panel,props.data, colorMode])

    const [uplot, setUplot] = useState<uPlot>(null)

    const onSelectSeries = (s,i) => {
        if (s == activeSeries.current) {
            activeSeries.current = null
            options.series.map((s1,j) => {
                // s1.show = true
                uplot.setSeries(j,{show: true})
            })
            dispatch({type:  ActiveSeriesEvent, id: props.panel.id, data: null})
        } else {
            activeSeries.current = s
            options.series.map((s1,j) => {
                if (s1.label==s) {
                    uplot.setSeries(j,{show: true})
                } else {
                    uplot.setSeries(j,{show: false})
                }
            })
            dispatch({type:  ActiveSeriesEvent, id: props.panel.id, data: s})
        }  
    }

    const onChartCreate = useCallback((chart) => { setUplot((chart)); props.sync?.sub(chart) }, [props.sync])


    return (
        <>
            <Box>
                {!isEmpty(props?.panel.settings.graph.axis?.label) && <Text fontSize="sm" position="absolute" ml="3" mt="-1" className="color-text">{props.panel.settings.graph.axis.label}</Text>}
                {options && <GraphLayout width={props.width} height={props.height} legend={props.panel.settings.graph.legend.mode == "hidden" ? null : <SeriesTable placement={props.panel.settings.graph.legend.placement} props={props} filterType={seriesFilterType.Current} onSelect={onSelectSeries} />}>
                    {(vizWidth: number, vizHeight: number) => {
                        if (uplot) {
                            if (props.width != vizWidth || props.height != vizHeight) {
                                uplot.setSize({ width: vizWidth, height: vizHeight })
                            }
                        }

                        return (options && <UplotReact
                            options={options}
                            data={data}
                            onDelete={(chart: uPlot) => { }}
                            onCreate={onChartCreate}
                        >
                            {props.panel.settings.graph.tooltip.mode != 'hidden' && <Tooltip props={props} options={options} />}
                        </UplotReact>
                        )
                    }}



                </GraphLayout>}
            </Box>
        </>
    )
})

export default GraphPanel


// transform Dataframes to uplot data
const transformDataToUplot = (data: DataFrame[]) => {
    const transformed = []

    // push x-axes data first
    if (isEmpty(data)) {
        return []
    }

    const xField = data[0].fields[0]
    transformed.push(xField.values)

    // push y-axes series data
    for (const d of data) {
        transformed.push(d.fields[1].values)
    }

    return transformed
}