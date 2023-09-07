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
import RadionButtons from "src/components/RadioButtons";
import { ColorPicker } from "src/components/ColorPicker";
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "src/components/editor/EditorItem";
import { UnitPicker } from "src/components/Unit";
import { OverrideRule } from "types/dashboard";
import React from "react";
import ValueCalculation from "src/components/ValueCalculation";
import ThresholdEditor from "src/components/Threshold/ThresholdEditor";

interface Props {
    override: OverrideRule
    onChange: any
}


const StatOverridesEditor = ({ override, onChange }: Props) => {
    switch (override.type) {
        case StatRules.SeriesName:
            return <EditorInputItem value={override.value} onChange={onChange} placeholder="change series name" />
        case StatRules.SeriesColorMode:
            return <RadionButtons size="sm" options={[{ label: "Value", value: "value" }, { label: "Background", value: "bg-solid" }, { label: "Background gradient", value: "bg-gradient" }]} value={override.value} onChange={onChange} />
        case StatRules.SeriesType:
            return <RadionButtons size="sm" options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }]} value={override.value} onChange={onChange} />
        case StatRules.SeriesFill:
            return <EditorSliderItem value={override.value} min={0} max={100} step={1} onChange={onChange} />
        case StatRules.SeriesUnit:
            return <UnitPicker size="sm" value={override.value}  onChange={onChange} />
        case StatRules.SeriesDecimal:
            return <EditorNumberItem value={override.value} min={0} max={5} step={1} onChange={onChange} />
        case StatRules.SeriesValueCalc:
            return <ValueCalculation value={override.value} onChange={onChange} />
        case StatRules.SeriesThresholds:
            return <ThresholdEditor value={override.value} onChange={onChange} enableTransform/>
        default:
            return <></>
    }

}

export default StatOverridesEditor


export enum StatRules {
    // basic
    SeriesName = 'Series.displayName',

    // styles
    SeriesColorMode = 'Series.colorMode',
    SeriesType = 'Series.type',
    SeriesFill = 'Series.fillOpacity',

    // value
    SeriesUnit = 'Series.unit',
    SeriesDecimal = 'Series.decimal',
    SeriesValueCalc = 'Series.valueCalc',

    // others
    SeriesThresholds = 'Series.thresholds',
}
