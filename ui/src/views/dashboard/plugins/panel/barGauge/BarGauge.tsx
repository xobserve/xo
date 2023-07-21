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
import { Box, useColorMode } from "@chakra-ui/react";
import ChartComponent from "components/charts/Chart";
import { round } from "lodash";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OverrideItem, Panel, PanelProps } from "types/dashboard"
import { GaugePluginData } from "types/plugins/gauge";
import { SeriesData } from "types/seriesData";
import { calcValueOnArray, calcValueOnSeriesData } from "utils/seriesData";
import React from "react";
import { BarGaugePluginData } from "types/plugins/barGauge";
import { ValueCalculationType } from "types/value";
import { BarGaugeSettings } from "types/panel/plugins";
import BarGauge, { BarGaugeValue } from "components/BarGauge/BarGauge";
import { findOverride } from "utils/dashboard/panel";
import { formatUnit } from "components/Unit";
import { getThreshold } from "components/Threshold/utils";
import { measureText } from "utils/measureText";

interface Props extends PanelProps {
    data: SeriesData[][]
}

const BarGaugePanel = (props: Props) => {
    const { panel, height, width } = props

    const rawData: SeriesData[] = useMemo(() => {
        let sd: SeriesData[] = props.data.flat()
        return sd
    }, [props.data])

    const [data,textWidth] = transformData(rawData, panel)
    console.log("here33333 barguage data:", data, textWidth)

    const options = props.panel.plugins.barGauge
    return (<BarGauge mode={options.mode} width={width} height={height} data={data} textWidth={textWidth} orientation={options.orientation} showUnfilled={options.style.showUnfilled}/>)
}

export default BarGaugePanel

const transformData = (data: SeriesData[],panel: Panel): [BarGaugeValue[],number] => {
    const options = panel.plugins.barGauge
    const result:BarGaugeValue[] = []
    let gmax
    let gmin
    let textWidth = 0;
    for (const s of data) {
        const override = findOverride(panel, s.name)
        for (const field of s.fields) {
            if (field.type === "number") {
                const max = Math.max(...field.values)
                const min = Math.min(...field.values)
                if (!gmax || max > gmax) gmax = max
                if (!gmin || min < gmin) gmin = min
                const value = calcValueOnArray(field.values,  options.value.calc)
                const text =  formatUnit(value, options.value.units, options.value.decimal)
                const width = measureText(text.toString(), options.style.valueSize).width
                if (width > textWidth) textWidth = width
                const title = s.name + "-" + field.name
                result.push({
                    title,
                    min: options.maxminFrom == "series" ? min : null,
                    max: options.maxminFrom == "series" ? max : null,
                    value,
                    text: text.toString()
                })
            }
        }
    }
    
    for (const r of result) {
        if (options.maxminFrom == "all") {
            if (r.max === null)  r.max = gmax
            if (r.min === null)  r.min = gmin
        }

        const threshold = getThreshold(r.value, options.thresholds, r.max)
        r.color = threshold.color
    }

    return [result,textWidth]
}