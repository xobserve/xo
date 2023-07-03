import UplotReact from "components/uPlot/UplotReact"
import { memo, useCallback, useMemo, useState } from "react"
import { PanelProps } from "types/dashboard"
import 'uplot/dist/uPlot.min.css';
import uPlot from "uplot"

import { parseOptions } from './options';
import { isEmpty } from "lodash"
import Tooltip from "../graph/Tooltip";
import { Box, Center, Flex, Text, useColorMode, Tooltip as ChakraTooltip } from "@chakra-ui/react";
import { formatUnit } from "components/unit";
import { ValueCalculationType } from "types/value";
import { calcValueOnSeriesData } from "utils/seriesData";
import { SeriesData } from "types/seriesData";


interface StatPanelProps extends PanelProps {
    data: SeriesData[][]
}

const StatPanel = memo((props: StatPanelProps) => {
    if (isEmpty(props.data)) {
        return (<Center height="100%">No data</Center>)
    }
    
    const [data, value]: [SeriesData[], number] = useMemo(() => {
        let res:SeriesData[] = [];
        if (props.data.length > 0) {
            // Stat only show the first series, Graph show all
            res.push(props.data[0][0])
        }
        
        const value = calcValueOnSeriesData(res[0], props.panel.plugins.stat.value.calc)
        return [res, value]
    }, [props.data])


    const { colorMode } = useColorMode()

    const [options, legend] = useMemo(() => {
        let o;
        let legend;
        // transform series name based on legend format 

        if (data.length > 0) {
            legend = data[0].name
        }
        o = parseOptions(props, data)

        return [o, legend]
    }, [props.panel, props.data, colorMode, props.width, props.height])

    const [uplot, setUplot] = useState<uPlot>(null)

    const onChartCreate = useCallback((chart) => { setUplot((chart)); props.sync?.sub(chart) }, [props.sync])


    return (
        <>
            <Box h="100%" className="panel-graph">
                {props.panel.plugins.stat.styles.graphHeight < 100 && <Box height={`${100 - props.panel.plugins.stat.styles.graphHeight}%`}>
                    {!isEmpty(data) &&
                        <Center height="100%">
                            <Flex width="100%" px={4} justifyContent={props.panel.plugins.stat.showLegend ? "space-between" : "center"} fontSize="50" color={props.panel.plugins.stat.styles.color} fontWeight="bold">
                                {props.panel.plugins.stat.showLegend && <ChakraTooltip label={legend}><Text maxWidth="50%" noOfLines={1}>{legend}</Text></ChakraTooltip>}
                                <Text >{props.panel.plugins.stat.value.calc == ValueCalculationType.Count ?
                                    value
                                    : formatUnit(value, props.panel.plugins.stat.value.units, props.panel.plugins.stat.value.decimal)}</Text>
                            </Flex>
                        </Center>}
                </Box>}
                <Box>
                    {options && <UplotReact
                        options={options}
                        data={transformDataToUplot(data)}
                        onDelete={(chart: uPlot) => { }}
                        onCreate={onChartCreate}
                    >
                        {props.panel.plugins.stat.showTooltip && <Tooltip props={props} options={options} data={data} inactiveSeries={[]} />}
                    </UplotReact>}
                </Box>
            </Box>
        </>
    )
})

export default StatPanel


const transformDataToUplot = (data: SeriesData[]) => {
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
