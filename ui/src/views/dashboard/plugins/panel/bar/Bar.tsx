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
import { Box, Center, Text, VStack, useColorMode } from "@chakra-ui/react"
import { OverrideItem, PanelProps } from "types/dashboard"
import React, { useCallback, useMemo, useState } from "react";
import { FieldType, SeriesData } from "types/seriesData";
import { isEmpty } from "utils/validate";
import { isSeriesData } from "utils/seriesData";
import { BarSeries } from "types/plugins/bar";
import BarChart from "./BarChart";
import { GraphLayout } from "../graph/GraphLayout";
import LegendTable from "./components/Legend";
import { findOverride, findRuleInOverride } from "utils/dashboard/panel";
import { BarRules } from "./OverridesEditor";
import { paletteColorNameToHex, palettes } from "utils/colors";
import { PanelInactiveKey } from "src/data/storage-keys";
import storage from "utils/localStorage";
import { cloneDeep } from "lodash";


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
    const { panel, width } = props
    const options = props.panel.plugins.bar
    const inactiveKey = PanelInactiveKey + props.dashboardId + '-' + props.panel.id
    const [inactiveSeries, setInactiveSeries] = useState(storage.get(inactiveKey) ?? [])
    const {colorMode} = useColorMode()
    
    const data: SeriesData[] = useMemo(() => {
        const res = []
        props.data.forEach(d0 => {
            const d = cloneDeep(d0)
            d.forEach((d1,i) => {
                d1.rawName = d1.name
                const override: OverrideItem = findOverride(props.panel, d1.rawName)  
                const name = findRuleInOverride(override,BarRules.SeriesName )
                if (name) {
                    d1.name = name
                } else {
                    d1.name = d1.rawName
                }
          
                let color = findRuleInOverride(override, BarRules.SeriesColor)
                if (!color) {
                    color = palettes[(colorMode == "light" ?  i+6 : i) % palettes.length]
                }
                d1.color = paletteColorNameToHex(color, colorMode)

                res.push(d1)
            })
        })
        return res
    }, [props.data, colorMode, panel.overrides])

    const onSeriesActive = useCallback((inacitve) => {
        setInactiveSeries(inacitve)
    },[])

    const chartData: BarSeries[] = useMemo(() => {
        const cdata = []
        for (const series of data) {
            if (inactiveSeries.includes(series.name)) {
                continue
             } 

            const barSeries: BarSeries = {
                rawName: series.rawName,
                name: series.name,
                color: series.color,
            }

            for (const f of series.fields) {
                if (barSeries.timestamps && barSeries.values) {
                    break
                }
                if (f.type == FieldType.Time) {
                    barSeries.timestamps = f.values
                } else if (f.type == FieldType.Number) {
                    barSeries.values = f.values
                }
            }
            cdata.push(barSeries)
        }

        return cdata
    }, [data, inactiveSeries])


    return (<>
        <GraphLayout
            width={props.width}
            height={props.height}
            legend={
                !options.legend.show
                    ?
                    null
                    :
                    <LegendTable 
                        placement={options.legend.placement} 
                        width={options.legend.width} 
                        props={props} 
                        data={data} 
                        inactiveSeries={inactiveSeries}
                        onSeriesActive={onSeriesActive}  />
            }
            >
            {(vizWidth: number, vizHeight: number) => {
               return  <BarChart data={chartData} width={vizWidth} height={vizHeight} panel={panel}  />
            }}



        </GraphLayout>
    </>


    )
}


