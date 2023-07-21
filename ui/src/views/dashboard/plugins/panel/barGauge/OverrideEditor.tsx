
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
import RadionButtons from "components/RadioButtons";
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem";
import { UnitPicker } from "components/Unit";
import { OverrideRule, Panel } from "types/dashboard";
import React, { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { barGaugePanelMsg, commonMsg, tablePanelMsg } from "src/i18n/locales/en";
import { Checkbox, HStack, Text } from "@chakra-ui/react";
import { isEmpty } from "utils/validate";
import ThresholdEditor from "components/Threshold/ThresholdEditor";
import { cloneDeep } from "lodash";


interface Props {
    override: OverrideRule
    onChange: any
}


const BarGaugeOverridesEditor = ({ override, onChange }: Props) => {
    const t1 = useStore(barGaugePanelMsg)
    switch (override.type) {
        case BarGaugeRules.SeriesName:
            return <OverrideNameEditor value={override.value} onChange={onChange} />
        case BarGaugeRules.SeriesFromMinMax:
            return <RadionButtons
                options={[{ label: t1.allSeries, value: "all" }, { label: t1.currentSeries, value: "series" }]}
                value={override.value}
                onChange={onChange} />
        case BarGaugeRules.SeriesMin:
            return <EditorNumberItem value={override.value} onChange={onChange} />
        case BarGaugeRules.SeriesMax:
            return <EditorNumberItem value={override.value} onChange={onChange} />
        case BarGaugeRules.SeriesDecimal:
            return <EditorNumberItem min={0} max={5} step={1} value={override.value} onChange={onChange} />
        case BarGaugeRules.SeriesUnits:
            return <UnitPicker size="sm" type={override.value.unitsType} value={override.value.units} onChange={
                (units, type) => {
                    onChange({
                        unitsType: type,
                        units: units
                    })
                }
            } />
        case BarGaugeRules.SeriesThresholds:
            return <ThresholdEditor value={override.value} onChange={onChange} />
        default:
            return <></>
    }

}

export default BarGaugeOverridesEditor

export enum BarGaugeRules {
    SeriesName = "Series.displayName",
    SeriesMin = "Series.min",
    SeriesMax = "Series.max",
    SeriesThresholds = "Series.thresholds",
    SeriesUnits = "Series.units",
    SeriesDecimal = "Series.decimal",
    SeriesFromMinMax = "Series.fromMinMax",
}

const OverrideNameEditor = ({ value, onChange }) => {
    if (isEmpty(value)) {
        value = {}
    }

    return <>
        <EditorInputItem value={value.name} onChange={v => {
            value.name = v
            onChange(cloneDeep(value))
        }} size="sm" placeholder="change series name" />
        <HStack>
            <Text fontSize="sm" color="gray.500" mt={1}>Override filed name</Text>
            <Checkbox isChecked={value.overrideField} onChange={e => {
                value.overrideField = e.currentTarget.checked
                onChange(cloneDeep(value))
            }} />
        </HStack>
    </>
}