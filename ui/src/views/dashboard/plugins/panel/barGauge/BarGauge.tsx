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
import { findOverride, findRuleInOverride } from "utils/dashboard/panel";
import { formatUnit } from "components/Unit";
import { getThreshold } from "components/Threshold/utils";
import { measureText } from "utils/measureText";
import { BarGaugeRules } from "./OverrideEditor";
import { isEmpty } from "utils/validate";

interface Props extends PanelProps {
    data: SeriesData[][]
}

const BarGaugePanel = (props: Props) => {
    const { panel, height, width } = props

    const rawData: SeriesData[] = useMemo(() => {
        let sd: SeriesData[] = props.data.flat()
        return sd
    }, [props.data])

    const [data, textWidth] = transformData(rawData, panel)
    console.log("here33333 barguage data:", data, textWidth)

    const options = props.panel.plugins.barGauge
    return (<BarGauge
        threshods={options.thresholds}
        mode={options.mode}
        width={width}
        height={height}
        data={data}
        textWidth={textWidth}
        orientation={options.orientation}
        showUnfilled={options.style.showUnfilled}
        titleSize={options.style.titleSize}
        textSize={options.style.valueSize}
    />)
}

export default BarGaugePanel

const transformData = (data: SeriesData[], panel: Panel): [BarGaugeValue[], number] => {
    const options = panel.plugins.barGauge
    const result: BarGaugeValue[] = []
    let gmax = options.max
    let gmin = options.min
    let textWidth = 0;
    for (const s of data) {
        const override = findOverride(panel, s.name)
        for (const field of s.fields) {
            if (field.type === "number") {
                const max = Math.max(...field.values)
                const min = Math.min(...field.values)
                if (!gmax || max > gmax) gmax = max
                if (!gmin || min < gmin) gmin = min
                const value = calcValueOnArray(field.values, options.value.calc)
                const text = formatUnit(value, options.value.units, options.value.decimal)
                const width = measureText(text.toString(), options.style.valueSize).width
                if (width > textWidth) textWidth = width
                const title = s.name + "-" + field.name
                result.push({
                    rawTitle: s.name,
                    title,
                    min: min,
                    max: max,
                    value,
                    text: text.toString()
                })
            }
        }
    }

    for (const r of result) {
        const override = findOverride(panel, r.rawTitle)
        if (options.maxminFrom == "all") {
            r.max = gmax
            r.min = gmin
        }

        if (!isEmpty(options.min)) {
            r.min = options.min
        }
        if (!isEmpty(options.max)) {
            r.max = options.max
        }

        const overrideMin = findRuleInOverride(override, BarGaugeRules.SeriesMin)
        const overrideMax = findRuleInOverride(override, BarGaugeRules.SeriesMax)
        if (!isEmpty(overrideMin)) {
            r.min = overrideMin.value
        }
        if (!isEmpty(overrideMax)) {
            r.max = overrideMax.value
        }


        const overredThresholds = findRuleInOverride(override, BarGaugeRules.SeriesThresholds)
        r.thresholds = overredThresholds


    }

    return [result, textWidth]
}