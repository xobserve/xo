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
import { Box, Button, Checkbox, HStack, Select, Text, Tooltip } from "@chakra-ui/react";
import RadionButtons from "components/RadioButtons";
import { ColorPicker } from "components/ColorPicker";
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem";
import { UnitPicker } from "components/Unit";
import { OverrideRule, Panel } from "types/dashboard";
import { colors } from "utils/colors";
import React from "react";
import { useStore } from "@nanostores/react";
import { commonMsg } from "src/i18n/locales/en";

interface Props {
    override: OverrideRule
    onChange: any
}


const TableOverridesEditor = ({ override, onChange }: Props) => {
    const t = useStore(commonMsg)
    switch (override.type) {
        case TableRules.ColumnTitle:
            return <EditorInputItem value={override.value} onChange={onChange} size="sm" placeholder="change column title display" />
        case TableRules.ColumnColor:
            return <ColorPicker presetColors={colors} color={override.value} onChange={v => onChange(v.hex)} />
        case TableRules.ColumnBg:
            return <ColorPicker presetColors={colors} color={override.value} onChange={v => onChange(v.hex)} />
        case TableRules.ColumnUnit:
            return <UnitPicker size="sm" type={override.value.unitsType} value={override.value.units} onChange={
                (units, type) => {
                    onChange({
                        unitsType: type,
                        units: units
                    })
                }
            } />
        case TableRules.ColumnDecimal:
                return <EditorNumberItem value={override.value} min={0} max={5} step={1} onChange={onChange} />
        case TableRules.ColumnWidth:
            return  <EditorInputItem value={override.value} onChange={onChange} size="sm" placeholder="css width, e.g 100px, 20%, auto" />
        case TableRules.ColumnFixed:
            return <RadionButtons size="sm" options={[{ label: "Left", value: "left" }, { label: "Right", value: "right" }]} value={override.value} onChange={onChange} />
        case 'Series.style':
            return <RadionButtons size="sm" options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }, { label: "points", value: "points" }]} value={override.value} onChange={onChange} />
        case 'Series.name':
            return <EditorInputItem value={override.value} onChange={onChange} size="sm" placeholder="change series name" />
        case 'Series.unit':
            return <UnitPicker size="sm" type={override.value.unitsType} value={override.value.units} onChange={
                (units, type) => {
                    onChange({
                        unitsType: type,
                        units: units
                    })
                }
            } />
        // case 'Series.color':
        //     return <ColorPicker presetColors={colors} color={override.value} onChange={v => onChange(v.hex)} ><Button size="sm" width="fit-content">Pick color</Button></ColorPicker>
        case 'Series.fill':
            return <EditorSliderItem value={override.value} min={0} max={100} step={1} onChange={onChange} />
        case 'Series.negativeY':
            return <></>
        case 'Series.decimal':
            return <EditorNumberItem value={override.value} min={0} max={5} step={1} onChange={onChange} />
        default:
            return <></>
    }

}

export default TableOverridesEditor

export enum TableRules {
    ColumnTitle = 'Column.title',
    ColumnColor = 'Column.color',
    ColumnBg = 'Column.background',
    ColumnUnit = 'Column.unit',
    ColumnDecimal = 'Column.decimal',
    ColumnWidth = 'Column.width',
    ColumnFixed = 'Column.fixed',
} 