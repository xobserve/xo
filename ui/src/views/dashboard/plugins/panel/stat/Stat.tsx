import UplotReact from "components/uPlot/UplotReact"
import { memo, useCallback, useMemo, useRef, useState } from "react"
import { PanelProps } from "types/dashboard"
import 'uplot/dist/uPlot.min.css';
import uPlot from "uplot"

import { parseOptions } from './options';
import { isEmpty } from "lodash";

import Tooltip from "./Tooltip";
import { Box, Center, Text, useColorMode } from "@chakra-ui/react";
import { colors } from "utils/colors";
import { parseLegendFormat } from "utils/format";
import { replaceWithVariables } from "utils/variable";
import { variables } from "src/views/dashboard/Dashboard";
import { GraphPluginData } from "types/plugins/graph";
import { StatPluginData } from "types/plugins/stat";
import { formatUnit } from "components/unit";


interface StatPanelProps extends PanelProps {
    data: StatPluginData[]
}

const StatPanel = memo((props: StatPanelProps) => {
    if (isEmpty(props.data)) {
        return (<Center height="100%">No data</Center>)
    }

    const [data,value] = useMemo(() => {
        const res = []
        let value;
        if (props.data.length > 0) {
            if (props.data[0].series.length > 0) {
                res.push(props.data[0].series[0])
                value = props.data[0].value
            }
        }
        
        return [res, value]
    }, [props.data])


    const { colorMode } = useColorMode()

    const [valueColor, options, plotData] = useMemo(() => {
        let o;
        let vc;
        // transform series name based on legend format 
        const ds = props.panel.datasource
        for (const query of ds.queries) {
            if (!isEmpty(query.legend)) {
                const formats = parseLegendFormat(query.legend)

                data.map(frame => {
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

            // set series line color
            data.map((frame, i) => {
                frame.color = colors[i % colors.length]
                vc = frame.color
            })


            o = parseOptions(props, data)
        }

        return [vc, o, transformDataToUplot(data)]
    }, [props.panel, props.data, colorMode])

    const [uplot, setUplot] = useState<uPlot>(null)

    const onChartCreate = useCallback((chart) => { setUplot((chart)); props.sync?.sub(chart) }, [props.sync])


    console.log("here333333:",data)
    return (
        <>
            <Box h="100%" className="panel-graph">

                <Box height="40%">
                    {!isEmpty(data) && 
                        <Center height="100%">
                            <Text fontSize="50" color={valueColor} fontWeight="bold">{formatUnit(value, props.panel.plugins.stat.units, props.panel.plugins.stat.decimal)}</Text>
                        </Center>}
                </Box>
                <Box>
                    {options && <UplotReact
                        options={options}
                        data={plotData}
                        onDelete={(chart: uPlot) => { }}
                        onCreate={onChartCreate}
                    >
                        {props.panel.plugins.stat.showTooltip && <Tooltip props={props} options={options} data={data} />}
                    </UplotReact>}
                </Box>
            </Box>
        </>
    )
})

export default StatPanel


const transformDataToUplot = (data: GraphPluginData) => {
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