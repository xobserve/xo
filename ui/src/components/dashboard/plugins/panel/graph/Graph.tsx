import UplotReact from "components/uPlot/UplotReact"
import { useEffect, useMemo, useState } from "react"
import { Panel, PanelProps } from "types/dashboard"
import 'uplot/dist/uPlot.min.css';
import uPlot from "uplot"

import { useOptions } from './use-options';
import { DataFrame } from "types/dataFrame";
import { cloneDeep, isEmpty } from "lodash";

import Tooltip from "./Tooltip";
import SeriesTable, { seriesFilterType } from "components/Tooltip/SeriesTable";
import { GraphLayout } from "layouts/plugins/GraphLayout";
import { Box, Center, Text } from "@chakra-ui/react";
import { colors } from "utils/colors";
import { parseLegendFormat } from "utils/format";




const GraphPanel = (props: PanelProps) => {
    const [config, setConfig] = useState<PanelProps>(null)
    useEffect(() => {
        if (props) {
            setConfig(props)
            // transform series name based on legend format 
            for (const ds of props.panel.datasource) {
                if (ds.selected) {
                    for (const query of ds.queries) {
                        if (!isEmpty(query.legend)) {
                            const formats = parseLegendFormat(query.legend)
                     
                            props.data.map(frame => {
                                if (frame.id == query.id) {
                                    if (!isEmpty(formats)) {
                                        for (const format of formats) {
                                            const l = frame.fields[1].labels[format]
                                            if (l) {
                                                frame.name = query.legend.replaceAll(`{{${format}}}`, l)
                                            }
                                        }
                                    } else {
                                        frame.name = query.legend
                                    }
                                  
                                }
                            })
                        }
                    }
                }
            }

            // set series line color
            props.data.map((frame,i) =>  frame.color = colors[i % colors.length])
        }
    }, [props])

    const [uplot, setUplot] = useState<uPlot>(null)

    const transformed = transformDataToUplot(props.data)

    const onSelectSeries = (s) => {
        props.panel.settings.graph.activeSeries =  props.panel.settings.graph.activeSeries  == s ? null : s

        setConfig(cloneDeep(props))
    }
    return (
        <>
        {
         isEmpty(props.data) ? 
         <Box h="100%">
            <Center height="100%">No data</Center></Box>
         :<Box>
            {!isEmpty(config?.panel.settings.graph.axis?.label) && <Text fontSize="sm" position="absolute" ml="3" mt="-1" className="color-text">{config.panel.settings.graph.axis.label}</Text>}
            {config && <GraphLayout width={props.width} height={props.height} legend={props.panel.settings.graph.legend.mode == "hidden" ? null : <SeriesTable placement={props.panel.settings.graph.legend.placement} props={props} filterType={seriesFilterType.Current} onSelect={onSelectSeries} />}>
                {(vizWidth: number, vizHeight: number) => {
                    const options = useOptions(config)
                    if (uplot) {
                        if (props.width != vizWidth || props.height != vizHeight) {
                            uplot.setSize({ width: vizWidth, height: vizHeight })
                        }

                    }

                    return (options && <UplotReact
                        options={options}
                        data={transformed}
                        onDelete={(chart: uPlot) => { }}
                        onCreate={(chart) => { setUplot((chart)) }}
                    >
                        {props.panel.settings.graph.tooltip.mode != 'hidden' && <Tooltip props={props} options={options} />}
                    </UplotReact>
                    )
                }}



            </GraphLayout>}
        </Box>
        }
        </>
        )
}

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