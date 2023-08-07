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
import { Box, Center, Text, VStack } from "@chakra-ui/react"
import { MarkdownRender } from "components/markdown/MarkdownRender"
import { PanelProps } from "types/dashboard"
import { replaceWithVariables } from "utils/variable"
import React, { useMemo } from "react";
import { FieldType, SeriesData } from "types/seriesData";
import { isEmpty } from "utils/validate";
import { isSeriesData } from "utils/seriesData";
import { BarSeries } from "types/plugins/bar";
import BarChart from "./BarChart";


interface BarPanelProps extends PanelProps {
    data: SeriesData[][]
}

const BarPanelWrapper = (props: BarPanelProps) => {
    if (isEmpty(props.data)) {
        return <Center height="100%">No data</Center>
    }
    
    return (<>
        {
            !isSeriesData(props.data[0])
                ?
                <Center height="100%">
                    <VStack>
                        <Text fontWeight={500} fontSize="1.1rem">Data format not support!</Text>
                        <Text className='color-text'>Try to change to Testdata or Prometheus datasource, then look into its data format in Panel Debug</Text>
                    </VStack>
                </Center>
                :
                <BarPanel {...props} />
        }
    </>
    )
}
export default BarPanelWrapper

const BarPanel = (props: BarPanelProps) => {
    const {panel, width} = props

    const data: BarSeries[] = useMemo(() => {
        const data = []
        for (const series of props.data.flat()) {
            const barSeries: BarSeries = {
                name: series.name,
            }

            for (const f of series.fields) {
                if (barSeries.timestamps && barSeries.values) {
                    break
                }
                if (f.type == FieldType.Time) {
                    barSeries.timestamps = f.values
                } else if (f.type == FieldType.Number){
                    barSeries.values = f.values
                }
            }
            data.push(barSeries)
        }

        return data
    },[props.data])


    return (<BarChart data={data} width={width} panel={panel} onSelect={() => {}} />)
}


