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
import { memo, useMemo } from "react"
import { PanelProps } from "types/dashboard"
import 'uplot/dist/uPlot.min.css';
import React from "react";
import { cloneDeep, isEmpty } from "lodash"
import { Box, Center, Flex } from "@chakra-ui/react";
import { SeriesData } from "types/seriesData";

import { VarialbeAllOption } from "src/data/variable";
import StatGraph from "./StatGraph";
import AutoGrid  from "components/grid/AutoGrid";


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
                for (const s0 of d) {
                    const s = cloneDeep(s0)
                    const selected = displaySeries == VarialbeAllOption || s.name == displaySeries
                    if (selected) {
                        res.push(s)
                    }
                }
            }
        }

        return res
    }, [props.data, props.panel.plugins.stat.diisplaySeries, props.panel.overrides])
    
    const options = props.panel.plugins.stat
    return (
        <>
            {
                options.styles.layout == "horizontal" && <>
                    {
                        data.map((seriesData,i) => {
                            const h = props.height / data.length
                            return <Box width={props.width}  height={h + 'px' }><StatGraph data={seriesData} panel={props.panel} width={props.width} height={h} /></Box>
                        })  
                    }
                </>
            }
            {
                options.styles.layout == "vertical" && <Flex>
                    {
                        data.map(seriesData => {
                            const width = (props.width - 3) / data.length
                            return <Box height={props.height}  width={width}><StatGraph data={seriesData} panel={props.panel} width={width} height={props.height} /></Box>
                        })
                    }
                </Flex>
            }
            {
                options.styles.layout == "auto" && <>
                    <AutoGrid 
                        width={props.width}
                        height={props.height}
                        orientation={options.styles.layout}
                        itemSpacing={3}
                        autoGrid={true}
                        values={data ?? []}
                        renderValue={({width, height, value})=> {
                            return (<>
                            <Box height={height}  width={width}><StatGraph data={value} panel={props.panel} width={width} height={height} /></Box>
                            </>)
                        }}
                    />
                </>
            }
        </>
    )
})

export default StatPanel
