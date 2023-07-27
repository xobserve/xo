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
import { isEmpty, round } from "lodash"
import Tooltip from "../graph/Tooltip";
import { Box, Center, Flex, Text, useColorMode, Tooltip as ChakraTooltip } from "@chakra-ui/react";
import { formatUnit } from "components/Unit";
import { ValueCalculationType } from "types/value";
import { calcValueOnSeriesData } from "utils/seriesData";
import { SeriesData } from "types/seriesData";
import { paletteColorNameToHex } from "utils/colors";
import { ThresholdsMode } from "types/threshold";
import { getThreshold } from "components/Threshold/utils";
import { VarialbeAllOption } from "src/data/variable";
import StatGraph from "./StatGraph";


interface StatPanelProps extends PanelProps {
    data: SeriesData[][]
}

const StatPanel = memo((props: StatPanelProps) => {
    if (isEmpty(props.data)) {
        return (<Center height="100%">No data</Center>)
    }

    const data: SeriesData[] = useMemo(() => {
        let res: SeriesData[] = [];
        const displaySeries = props.panel.plugins.stat.diisplaySeries
        if (props.data.length > 0) {
            for (const d of props.data) {
                for (const s of d) {
                    if (s.name == displaySeries) {
                        res.push(s)
                    } else {
                        if (displaySeries == VarialbeAllOption) {
                            res.push(s)
                        }
                    }
                }
            }

            if (res.length == 0) {
                res.push(props.data[0][0])
            }
        }

        return res
    }, [props.data, props.panel.plugins.stat.diisplaySeries])

    return (
        <>
            {
                props.panel.plugins.stat.styles.layout == "horizontal" && <Box>
                    {
                        data.map((seriesData,i) => {
                            return <Box width="100%"  bg="orange" className="bordered-bottom" height={round(props.height / data.length)+ 'px' }><StatGraph data={seriesData} panel={props.panel} width={props.width} height={round(props.height / data.length)} /></Box>
                        })  
                    }
                </Box>
            }
            {
                props.panel.plugins.stat.styles.layout == "vertical" && <Flex>
                    {
                        data.map(seriesData => {
                            const width = round((props.width - 3) / data.length)
                            return <Box className="bordered-right" bg="orange" height={props.height}  width={width}><StatGraph data={seriesData} panel={props.panel} width={width} height={props.height} /></Box>
                        })
                    }
                </Flex>
            }
            {
                props.panel.plugins.stat.styles.layout == "auto" && <Box>
                    {/* {
                        data.map(seriesData => {
                            return <Box width="100%" height={props.height / 3}><StatGraph data={seriesData} panel={props.panel} width={props.width} height={props.height / 3} /></Box>
                        })
                    } */}
                </Box>
            }
        </>
    )
})

export default StatPanel
