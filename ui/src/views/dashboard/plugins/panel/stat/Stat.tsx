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
import UplotReact from "components/uPlot/UplotReact"
import { memo, useCallback, useMemo, useState } from "react"
import { PanelProps } from "types/dashboard"
import 'uplot/dist/uPlot.min.css';
import uPlot from "uplot"
import React from "react";
import { parseOptions } from './options';
import { isEmpty } from "lodash"
import Tooltip from "../graph/Tooltip";
import { Box, Center, Flex, Text, useColorMode, Tooltip as ChakraTooltip } from "@chakra-ui/react";
import { formatUnit } from "components/Unit";
import { ValueCalculationType } from "types/value";
import { calcValueOnSeriesData } from "utils/seriesData";
import { SeriesData } from "types/seriesData";
import { paletteColorNameToHex } from "utils/colors";
import { ThresholdsMode } from "types/threshold";
import { getThreshold } from "components/Threshold/utils";


interface StatPanelProps extends PanelProps {
    data: SeriesData[][]
}

const StatPanel = memo((props: StatPanelProps) => {
    if (isEmpty(props.data)) {
        return (<Center height="100%">No data</Center>)
    }
    
    const data: SeriesData[] = useMemo(() => {
        let res:SeriesData[] = [];
        if (props.data.length > 0) {
            // Stat only show the first series, Graph show all
            res.push(props.data[0][0])
        }
        
        return res
    }, [props.data])


    const { colorMode } = useColorMode()

    const [value, options, legend, color] = useMemo(() => {
        const value = calcValueOnSeriesData(data[0], props.panel.plugins.stat.value.calc)
        let max = 0; 
        if (props.panel.plugins.stat.thresholds.mode == ThresholdsMode.Percentage) {
            max = calcValueOnSeriesData(data[0], ValueCalculationType.Max)
        }
        const threshold = getThreshold(value, props.panel.plugins.stat.thresholds,max)
        const color = paletteColorNameToHex(threshold.color,colorMode)

        let o;
        let legend;
        // transform series name based on legend format 

        if (data.length > 0) {
            legend = data[0].name
        }
        o = parseOptions(props,color,data)

        return [value, o, legend, color]
    }, [props.panel, props.data, colorMode, props.width, props.height])

    const [uplot, setUplot] = useState<uPlot>(null)

    const onChartCreate = useCallback((chart) => { setUplot((chart)); props.sync?.sub(chart) }, [props.sync])

    
    return (
        <>
            <Box h="100%" className="panel-graph">
                {props.panel.plugins.stat.styles.graphHeight < 100 && <Box height={`${100 - props.panel.plugins.stat.styles.graphHeight}%`}>
                    {!isEmpty(data) &&
                        <Center height="100%">
                            <Flex width="100%" px={4} justifyContent={props.panel.plugins.stat.showLegend ? "space-between" : "center"}  >
                                {props.panel.plugins.stat.showLegend && <ChakraTooltip label={legend}><Text maxWidth="50%" fontSize={16}>{legend}</Text></ChakraTooltip>}
                                <Text fontSize="50" color={color} fontWeight="bold">{props.panel.plugins.stat.value.calc == ValueCalculationType.Count ?
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
