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

import { Panel, PanelEditorProps } from "types/dashboard"

import React from "react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { useStore } from "@nanostores/react"
import { commonMsg } from "src/i18n/locales/en"
import { EditorNumberItem } from "components/editor/EditorItem"
import ValueCalculation from "components/ValueCalculation"
import { UnitPicker } from "components/Unit"
import RadionButtons from "components/RadioButtons"
import { Switch } from "@chakra-ui/react"
import ThresholdEditor from "components/Threshold/ThresholdEditor"

const BarGaugeEditor = ({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)


    return (<>
        <PanelAccordion title={t.basicSetting}>
            <PanelEditItem title="Orientation" desc="Layout direction">
                <RadionButtons options={[{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }]} value={panel.plugins.barGauge.orientation} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.barGauge.orientation = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Display mode">
                <RadionButtons options={[{ label: "Basic", value: "basic" }, { label: "Retro LCD", value: "lcd" }]} value={panel.plugins.barGauge.mode} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.barGauge.mode = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t.valueSettings}>
            <PanelEditItem title={t.unit}>
                <UnitPicker type={panel.plugins.barGauge.value.unitsType} value={panel.plugins.barGauge.value.units} onChange={
                    (units, type) => onChange((panel: Panel) => {
                        panel.plugins.barGauge.value.units = units
                        panel.plugins.barGauge.value.unitsType = type
                    })
                } />
            </PanelEditItem>

            <PanelEditItem title={t.decimal}>
                <EditorNumberItem value={panel.plugins.barGauge.value.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.barGauge.value.decimal = v })} />
            </PanelEditItem>
            <PanelEditItem title={t.calc} desc={t.calcTips}>
                <ValueCalculation value={panel.plugins.barGauge.value.calc} onChange={v => {
                    onChange((panel: Panel) => { panel.plugins.barGauge.value.calc = v })
                }} />
            </PanelEditItem>
            <PanelEditItem title="Min" desc="Leave empty to calculate based on all values">
                <EditorNumberItem   value={panel.plugins.barGauge.min} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.barGauge.min = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Max" desc="Leave empty to calculate based on all values">
                <EditorNumberItem value={panel.plugins.barGauge.max} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.barGauge.max = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Calc max/min from">
                <RadionButtons options={[{ label: "All Series", value: "all" }, { label: "Current Series", value: "series" }]} value={panel.plugins.barGauge.maxminFrom} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.barGauge.maxminFrom = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Show max" desc="Display max beside value">
                <Switch isChecked={panel.plugins.barGauge.showMax} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.barGauge.showMax = e.currentTarget.checked
                })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Styles">
            <PanelEditItem title="Show unfilled area" desc="When enabled renders the unfilled region as gray">
                <Switch isChecked={panel.plugins.barGauge.style.showUnfilled} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.barGauge.style.showUnfilled = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Title font size">
                <EditorNumberItem value={panel.plugins.barGauge.style.titleSize} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.barGauge.style.titleSize = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Value font size">
                <EditorNumberItem value={panel.plugins.barGauge.style.valueSize} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.barGauge.style.valueSize = v
                })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Thresholds">
                <ThresholdEditor value={panel.plugins.barGauge.thresholds} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.barGauge.thresholds = v
                })} />
        </PanelAccordion>
    </>)

}

export default BarGaugeEditor