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
import { ColorPicker } from "components/ColorPicker";
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem";
import { UnitPicker } from "components/Unit";
import { OverrideRule, Panel } from "types/dashboard";
import { colors } from "utils/colors";
import React, { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { commonMsg } from "src/i18n/locales/en";
import { Box, Checkbox, Text } from "@chakra-ui/react";
import { isEmpty } from "utils/validate";
import { CodeEditorModal } from "components/CodeEditor/CodeEditorModal";
import ThresholdEditor from "components/Threshold/ThresholdEditor";
import { cloneDeep } from "lodash";


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
        case TableRules.ColumnType:
            return <ClumnTypeEditor value={override.value} onChange={onChange} />
        case TableRules.ColumnOpacity:
            return <EditorSliderItem value={override.value} min={0} max={1} step={0.1} onChange={onChange} />
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
            return <EditorInputItem value={override.value} onChange={onChange} size="sm" placeholder="css width, e.g 100px, 20%, auto" />
        case TableRules.ColumnFixed:
            return <RadionButtons size="sm" options={[{ label: "Left", value: "left" }, { label: "Right", value: "right" }]} value={override.value} onChange={onChange} />
        case TableRules.ColumnFilter:
            return <RadionButtons size="sm" options={[{ label: "Number min/max", value: "number" }, { label: "String match", value: "string" }]} value={override.value} onChange={onChange} />
        case TableRules.ColumnSort:
            return <Box>
                <RadionButtons size="sm" options={[{ label: "Descend", value: "descend" }, { label: "Ascend", value: "ascend" }]} value={override.value} onChange={onChange} />
            </Box>
        case TableRules.ColumnEllipsis:
            return <Checkbox size="lg" isChecked={override.value} onChange={e => onChange(e.currentTarget.checked)} />
        case TableRules.ColumnDisplay:
            return <Checkbox size="lg" isChecked={isEmpty(override.value) ? true : override.value} onChange={e => onChange(e.currentTarget.checked)} />
        case TableRules.ColumnTransform:
            return <CodeEditorModal value={isEmpty(override.value) ? transformFunc : override.value} onChange={onChange} />
        case TableRules.ColumnThreshold:
            return <ThresholdEditor value={override.value} onChange={onChange} />
        default:
            return <></>
    }

}

export default TableOverridesEditor

export enum TableRules {
    ColumnTitle = 'Column.title',
    ColumnColor = 'Column.color',
    ColumnBg = 'Column.background',
    ColumnType = "Column.cellType",
    ColumnOpacity = "Column.fillOpacity(background and Gauge)",
    ColumnUnit = 'Column.unit',
    ColumnDecimal = 'Column.decimal',
    ColumnWidth = 'Column.width',
    ColumnFixed = 'Column.fixed',
    ColumnSort = 'Column.sort',
    ColumnFilter = 'Column.filter',
    ColumnEllipsis = 'Column.textEllipsis',
    ColumnDisplay = "Column.display",
    ColumnTransform = "Column.textTransform",
    ColumnThreshold = "Column.threshold",
}

const transformFunc = `
function transform(text, lodash, moment)  {
    // for demonstration purpose: how to use 'lodash'
    const t0 = lodash.cloneDeep(text)
    // for demonstration purpose: how to use 'moment'
    const t = moment(text * 1000).format("YY-MM-DD HH:mm::ss")

    return text
}
`

const ClumnTypeEditor = ({ value, onChange }) => {
    if (isEmpty(value)) {
        value = {}
    }

    return (
        <>
            <RadionButtons size="sm" options={[{ label: "Normal", value: "normal" }, { label: "Gauge", value: "gauge" }]} value={value.type} onChange={v => {
                value.type = v
                onChange(cloneDeep(value))
            }} />
            {value.type == "gauge" && <>
                <Text>
                    Gauge display mode
                </Text>
                <RadionButtons size="sm" options={[{ label: "Basic", value: "basic" }, { label: "Retro LCD", value: "lcd" }]} value={value.mode} onChange={v => {
                    value.mode = v
                    onChange(cloneDeep(value))
                }} />
            </>}
        </>
    )
}