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
import { Panel } from "types/dashboard"
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


interface Props {
    panel: Panel
    data: SeriesData
    width: number
    height: number
}

const StatGraph = memo((props: Props) => {
    const { data, width, height, panel } = props
    const { colorMode } = useColorMode()

    const statOptions = panel.plugins.stat
    const [value, options, legend, color] = useMemo(() => {
        const value = calcValueOnSeriesData(data, statOptions.value.calc)
        let max = 0;
        if (statOptions.thresholds.mode == ThresholdsMode.Percentage) {
            max = calcValueOnSeriesData(data, ValueCalculationType.Max)
        }
        const threshold = getThreshold(value, statOptions.thresholds, max)
        const color = paletteColorNameToHex(threshold.color, colorMode)

        let o;
        let legend;
        // transform series name based on legend format 

        legend = data.name
        o = parseOptions(props, color, data)

        return [value, o, legend, color]
    }, [panel, data, colorMode, width, height])


    const graphHeight = statOptions.styles.graphHeight
    return (
        <>
            <Box h="100%" className="stat-graph" bg="orange" mt="1" width="100%">
                {
                    statOptions.styles.layout == "horizontal" && <>
                        {graphHeight < 100 && <Box height={height > statOptions.styles.hideGraphHeight ? `${100 - graphHeight}%` : '100%'} className="stat-graph-text">
                            <Center height="100%" pt={height > statOptions.styles.hideGraphHeight ? 2 : 0}>
                                <Flex width="100%" px={4} alignItems="center" justifyContent={statOptions.showLegend ? "space-between" : "center"} >
                                    {statOptions.showLegend && <LegentText legend={legend} height={height} />}
                                    <ValueText value={value} color={color} options={statOptions} height={height} />
                                </Flex>
                            </Center>
                        </Box>}
                        {height > statOptions.styles.hideGraphHeight && <Box height={graphHeight + '%'} className="stat-graph-container">
                            <GraphPlot options={options} data={data} props={props} />
                        </Box>}
                    </>
                }


            </Box>
        </>
    )
})

export default StatGraph

const LegentText = ({ legend, height }) => {
    let fontSize = 16
    if (height < 100) {
        fontSize = 14
    }
    return (
        <>
            <ChakraTooltip label={legend}><Text maxWidth="50%" fontSize={fontSize + 'px'}>{legend}</Text></ChakraTooltip>
        </>
    )
}

const ValueText = ({ value, color, options, height }) => {
    const minFonSize = 16
    const maxFontSize = 40
    let fontSize = height / 2.7
    if (fontSize < minFonSize) fontSize = minFonSize
    if (fontSize > maxFontSize) fontSize = maxFontSize


    console.log("here33333 height:", height)
    return (<>
        <Text
            fontSize={fontSize + 'px'}
            color={color}
            fontWeight="bold"
        >{options.value.calc == ValueCalculationType.Count ?
            value
            : formatUnit(value, options.value.units, options.value.decimal)}</Text>
    </>)
}

const GraphPlot = ({ options, data, props }) => {
    return (<>
        {options && <UplotReact
            options={options}
            data={transformDataToUplot([data])}
            onDelete={() => { }}
            onCreate={() => { }}
        >
            {props.panel.plugins.stat.showTooltip && <Tooltip props={props} options={options} data={[data]} inactiveSeries={[]} />}
        </UplotReact>}
    </>)
}

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
