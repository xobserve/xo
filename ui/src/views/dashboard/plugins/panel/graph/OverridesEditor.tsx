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
import { Box, Button, HStack, Select, Switch, Tooltip } from "@chakra-ui/react";
import RadionButtons from "src/components/RadioButtons";
import { ColorPicker } from "src/components/ColorPicker";
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "src/components/editor/EditorItem";
import { UnitPicker } from "src/components/Unit";
import { OverrideRule, Panel } from "types/dashboard";
import React from "react";
import { dispatch } from "use-bus";
import { PanelForceRebuildEvent } from "src/data/bus-events";
import ThresholdEditor from "src/components/Threshold/ThresholdEditor";
import { palettes } from "utils/colors";

interface Props {
    override: OverrideRule
    onChange: any
    panel: Panel
}


const GraphOverridesEditor = ({ override, onChange, panel }: Props) => {
    switch (override.type) {
        case GraphRules.SeriesStyle:
            return <RadionButtons size="sm" options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }, { label: "points", value: "points" }]} value={override.value} onChange={onChange} />
        case GraphRules.SeriesLineWidth:
            return <EditorSliderItem value={override.value} min={0} max={10} step={1} onChange={onChange} />
        case GraphRules.SeriesName:
            return <EditorInputItem value={override.value} onChange={onChange} size="sm" placeholder="change series name" />
        case GraphRules.SeriesUnit:
            return <UnitPicker size="sm" value={override.value} onChange={v => {
                onChange(v)
                dispatch(PanelForceRebuildEvent + panel.id)
            }} />
        case GraphRules.SeriesColor:
            return <ColorPicker color={override.value} onChange={onChange} defaultColor={palettes[0]} />
        case GraphRules.SeriesFill:
            return <EditorSliderItem value={override.value} min={0} max={100} step={1} onChange={v => {
                onChange(v)
                dispatch(PanelForceRebuildEvent + panel.id)
            }} />
        case GraphRules.SeriesNegativeY:
            return <Switch defaultChecked={override.value} onChange={e => onChange(e.currentTarget.checked)} />
        case GraphRules.SeriesYAxis:
            return <Switch defaultChecked={override.value} onChange={e => onChange(e.currentTarget.checked)} />
        case GraphRules.SeriesDecimal:
            return <EditorNumberItem value={override.value} min={0} max={5} step={1} onChange={onChange} />
        case GraphRules.SeriesThresholds:
            return <ThresholdEditor value={override.value} onChange={v => {
                onChange(v)
                dispatch(PanelForceRebuildEvent + panel.id)
            }} />
        default:
            return <></>
    }

}

export default GraphOverridesEditor


export enum GraphRules {
    SeriesName = 'Series.name',
    SeriesStyle = 'Series.style',
    SeriesLineWidth = 'Series.lineWidth',
    SeriesUnit = 'Series.unit',
    SeriesDecimal = 'Series.decimal',
    SeriesColor = 'Series.color',
    SeriesFill = 'Series.fill',
    SeriesNegativeY = 'Series.negativeY',
    SeriesYAxis = 'Series.separateYAxis',
    SeriesThresholds = "Series.thresholds"
}
