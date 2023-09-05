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
import { OverrideRule, Panel } from "types/dashboard";
import React from "react";
import { useStore } from "@nanostores/react";
import { commonMsg, tablePanelMsg } from "src/i18n/locales/en";
import { Box, Checkbox, Text } from "@chakra-ui/react";
import { isEmpty } from "utils/validate";
import { CodeEditorModal } from "src/components/CodeEditor/CodeEditorModal";
import ThresholdEditor from "src/components/Threshold/ThresholdEditor";
import { cloneDeep } from "lodash";
import ValueMapping from "src/components/ValueMapping/ValueMapping";
import { dispatch } from "use-bus";
import { PanelForceRebuildEvent } from "src/data/bus-events";


interface Props {
    panel: Panel
    override: OverrideRule
    onChange: any
}


const TableOverridesEditor = ({panel, override, onChange }: Props) => {
    const t = useStore(commonMsg)
    const t1 = useStore(tablePanelMsg)
    switch (override.type) {
        case TableRules.ColumnTitle:
            return <EditorInputItem value={override.value} onChange={onChange} size="sm" placeholder={t1.seriesName} />
        case TableRules.ColumnColor:
            return <ColorPicker color={override.value} onChange={onChange} />
        case TableRules.ColumnBg:
            return <ColorPicker  color={override.value} onChange={onChange} />
        case TableRules.ColumnType:
            return <ClumnTypeEditor value={override.value} onChange={onChange} />
        case TableRules.ColumnOpacity:
            return <EditorSliderItem value={override.value} min={0} max={1} step={0.1} onChange={onChange} />
        case TableRules.ColumnUnit:
            return <UnitPicker size="sm" value={override.value}  onChange={onChange} />
        case TableRules.ColumnDecimal:
            return <EditorNumberItem value={override.value} min={0} max={5} step={1} onChange={onChange} />
        case TableRules.ColumnWidth:
            return <EditorInputItem value={override.value} onChange={onChange} size="sm" placeholder="css width, e.g 100px, 20%, auto" />
        case TableRules.ColumnFixed:
            return <RadionButtons size="sm" options={[{ label: t.left, value: "left" }, { label: t.right, value: "right" }]} value={override.value} onChange={onChange} />
        case TableRules.ColumnFilter:
            return <RadionButtons size="sm" options={[{ label: t1.seriesFilter1, value: "number" }, { label: t1.seriesFilter2, value: "string" }]} value={override.value} onChange={onChange} />
        case TableRules.ColumnSort:
            return <Box>
                <RadionButtons size="sm" options={[{ label: t.descend, value: "descend" }, { label: t.ascend, value: "ascend" }]} value={override.value} onChange={v => {
                    onChange(v)
                    dispatch(PanelForceRebuildEvent + panel.id)
                }} />
            </Box>
        case TableRules.ColumnEllipsis:
            return <Checkbox size="lg" isChecked={override.value} onChange={e => onChange(e.currentTarget.checked)} />
        case TableRules.ColumnDisplay:
            return <Checkbox size="lg" isChecked={isEmpty(override.value) ? true : override.value} onChange={e => onChange(e.currentTarget.checked)} />
        case TableRules.ColumnTransform:
            return <CodeEditorModal value={isEmpty(override.value) ? transformFunc : override.value} onChange={onChange} />
        case TableRules.ColumnThreshold:
            return <ThresholdEditor value={override.value} onChange={onChange} />
        case TableRules.ColumnValueMapping:
            return  <ValueMapping value={override.value} onChange={onChange} />
            
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
    ColumnThreshold = "Column.thresholds",
    ColumnValueMapping = "Column.valueMapping",
}

const transformFunc = `
function transform(text, lodash, moment)  {
    const t = moment(text * 1000).format("YY-MM-DD HH:mm::ss a")
    // if you want to use t, just modify the return statement below: change text -> t
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