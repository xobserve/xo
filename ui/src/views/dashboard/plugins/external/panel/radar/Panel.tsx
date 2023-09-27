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
import { Box, Center, Text, useColorMode } from "@chakra-ui/react";
import ChartComponent from "src/components/charts/Chart";
import { memo, useMemo, useState } from "react";
import { PanelProps } from "types/dashboard"
import { FieldType, SeriesData } from "types/seriesData";
import React from "react";
import { isEmpty } from "utils/validate";
import NoData from "src/views/dashboard/components/PanelNoData";
import { defaultsDeep } from "lodash";
import { PluginSettings, initSettings } from "./types";
import { buildOptions } from "./buildOptions";
import mockData from './mockData.json'
import { isSeriesData } from "utils/seriesData";

interface Props extends PanelProps {
    data: SeriesData[][]
}

const PanelComponentWrapper = memo((props: Props) => {
    const d: SeriesData[] = props.data.flat()
    if (isEmpty(d)) {
        return <Center height="100%"><NoData /></Center>
    }

    return (<>
        <PanelComponent {...props} />
    </>
    )
})

export default PanelComponentWrapper

const PanelComponent = (props: Props) => {
    const { panel, height, width } = props
    const [chart, setChart] = useState(null)
    const { colorMode } = useColorMode()


    // init panel plugin settings
    props.panel.plugins[panel.type] = defaultsDeep(props.panel.plugins[panel.type], initSettings)
    // give plugin settings a name for easy access
    const options: PluginSettings = props.panel.plugins[panel.type]

    const echartOptions = useMemo(() => {
        // transform SeriesData to candlestick data format 
        const option = buildOptions(panel, props.data.flat(), colorMode)
        console.log('====>option:', option)
        return option
    }, [props.data, panel.overrides, colorMode, options])

    return (<>
        {options && <Box height={height} key={colorMode} className="echarts-panel"><ChartComponent options={echartOptions} theme={colorMode} width={width} height={height} onChartCreated={c => setChart(c)} onChartEvents={null} /></Box>}
    </>)
}

export const mockDataForTestDataDs = () => {
    return mockData
}
