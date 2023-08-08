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
import { Switch, Textarea } from "@chakra-ui/react"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import RadionButtons from "components/RadioButtons"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, textPanelMsg } from "src/i18n/locales/en"
import { UnitPicker } from "components/Unit"
import { Units } from "types/panel/plugins"
import ValueCalculation from "components/ValueCalculation"

const BarPanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    return (<>
        <PanelAccordion title={t.basicSetting}>
            <PanelEditItem title="Show grid">
                <Switch defaultChecked={panel.plugins.bar.showGrid} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.bar.showGrid = e.currentTarget.checked
                })} />
            </PanelEditItem>

            <PanelEditItem title="Tooltip">
                <RadionButtons options={[{ label: "Single", value: "single" }, { label: "All", value: "all" }, { label: "None", value: "none" }]} value={panel.plugins.bar.tooltip} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.bar.tooltip = v
                })} />
            </PanelEditItem>

            <PanelEditItem title="Show label" desc="Value label display on bars">
                <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: 'always' }, { label: "None", value: 'none' }]} value={panel.plugins.bar.showLabel} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.bar.showLabel = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Stack">
                <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: 'always' }, { label: "None", value: 'none' }]} value={panel.plugins.bar.stack} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.bar.stack = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={"Axis"}>
            <PanelEditItem title="Swap XY">
                <Switch defaultChecked={panel.plugins.bar.axis.swap} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.bar.axis.swap = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Min bars">
                <EditorNumberItem value={panel.plugins.bar.value.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.bar.value.decimal = v })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t.styles}>

        </PanelAccordion>

        <PanelAccordion title={t.valueSettings}>
            <PanelEditItem title={t.unit}>
                <UnitPicker value={panel.plugins.bar.value} onChange={
                    (v:Units) => onChange((panel: Panel) => {
                        panel.plugins.bar.value.units = v.units
                        panel.plugins.bar.value.unitsType = v.unitsType
                    })
                } />
            </PanelEditItem>

            <PanelEditItem title={t.decimal}>
                <EditorNumberItem value={panel.plugins.bar.value.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.bar.value.decimal = v })} />
            </PanelEditItem>
        </PanelAccordion>
    </>
    )
})

export default BarPanelEditor