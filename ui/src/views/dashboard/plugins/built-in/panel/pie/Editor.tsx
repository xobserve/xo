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
import { Select, Switch } from "@chakra-ui/react"
import RadionButtons from "src/components/RadioButtons"
import ValueCalculation from "src/views/dashboard/plugins/components/ValueCalculation"
import { EditorInputItem, EditorNumberItem } from "src/components/editor/EditorItem"
import { UnitPicker } from "src/views/dashboard/plugins/components/UnitPicker"
import { memo } from "react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import { PieLegendPlacement, Units } from "types/panel/plugins"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, piePanelMsg } from "src/i18n/locales/en"
import ThresholdEditor from "src/views/dashboard/plugins/components/Threshold/ThresholdEditor"
import { CodeEditorModal } from "src/components/CodeEditor/CodeEditorModal"
import { dispatch } from "use-bus"
import { PanelForceRebuildEvent } from "src/data/bus-events"

const PiePanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(piePanelMsg)
    return (<>
        <PanelAccordion title={t.basicSetting}>
            <PanelEditItem title={t.animation} desc={t.animationTips}>
                <Switch defaultChecked={panel.plugins.pie.animation} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.animation = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={"Top"}>
                <EditorInputItem value={panel.plugins.pie.top} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.top = v
                })} placeholder="css top, e.g 50%, 100px" />
            </PanelEditItem>
            <PanelEditItem title={"Left"}>
                <EditorInputItem value={panel.plugins.pie.left} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.left = v
                })} placeholder="css left, e.g 50%, 100px" />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title={t.label}>
            <PanelEditItem title={t1.showLabel} desc={t1.showLabelTips}>
                <Switch defaultChecked={panel.plugins.pie.label.show} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.label.show = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={"Show name"}>
                <Switch defaultChecked={panel.plugins.pie.label.showName} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.label.showName = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={"Show value"}>
                <Switch defaultChecked={panel.plugins.pie.label.showValue} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.label.showValue = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={"Align to"}>
                <RadionButtons options={[{ label: "None", value: "none" }, { label: "LabelLine", value: "labelLine" }, { label: "edge", value: "edge" }]} value={panel.plugins.pie.label.align} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.pie.label.align = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={"Margin"}>
                <EditorNumberItem value={panel.plugins.pie.label.margin} min={0} max={50} step={1} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.label.margin = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={"Font size"}>
                <EditorNumberItem value={panel.plugins.pie.label.fontSize} min={8} max={30} step={1} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.label.fontSize = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={"Line height"}>
                <EditorNumberItem value={panel.plugins.pie.label.lineHeight} min={1} max={50} step={1} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.label.lineHeight = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={"Transform label name"}>
                <CodeEditorModal value={panel.plugins.pie.label.transformName} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.pie.label.transformName = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t1.shape}>
            <PanelEditItem title={t.type}>
                <RadionButtons options={[{ label: "Normal", value: "normal" }, { label: "Rose", value: "rose" }]} value={panel.plugins.pie.shape.type} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.type = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t1.borderRadius}>
                <EditorNumberItem value={panel.plugins.pie.shape.borderRadius} min={0} max={20} step={1} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.borderRadius = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t1.pieRadius}>
                <EditorNumberItem value={panel.plugins.pie.shape.radius} min={0} max={100} step={5} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.radius = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t1.innerRadius}>
                <EditorNumberItem value={panel.plugins.pie.shape.innerRadius} min={0} max={100} step={5} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.innerRadius = v
                })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Legend">
            <PanelEditItem title={t.enable}>
                <Switch defaultChecked={panel.plugins.pie.legend.show} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.legend.show = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={t1.orient}>
                <RadionButtons options={[{ label: t.vertical, value: "vertical" }, { label: t.horizontal, value: "horizontal" }]} value={panel.plugins.pie.legend.orient} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.pie.legend.orient = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t1.placement}>
                <Select value={panel.plugins.pie.legend.placement} onChange={e => {
                    const v = e.currentTarget.value
                    onChange((panel: Panel) => {
                        panel.plugins.pie.legend.placement = v as any
                    })
                }}>
                    {
                        Object.keys(PieLegendPlacement).map(k => <option value={PieLegendPlacement[k]}>{k}</option>)
                    }
                </Select>
            </PanelEditItem>
            <PanelEditItem title={t.width}>
                <EditorNumberItem value={panel.plugins.pie.legend.width} min={0} max={50} step={1} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.legend.width = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t.height}>
                <EditorNumberItem value={panel.plugins.pie.legend.height} min={0} max={50} step={1} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.legend.height = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Gap">
                <EditorNumberItem value={panel.plugins.pie.legend.gap} min={0} max={50} step={1} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.legend.gap = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Font size">
                <EditorNumberItem value={panel.plugins.pie.legend.fontSize} min={8} max={30} step={1} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.legend.fontSize = v
                })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Value">
            <PanelEditItem title={t.unit}>
                <UnitPicker value={panel.plugins.pie.value} onChange={
                    (v: Units) => onChange((panel: Panel) => {
                        panel.plugins.pie.value.units = v.units
                        panel.plugins.pie.value.unitsType = v.unitsType
                    })
                } />
            </PanelEditItem>
            <PanelEditItem title={t.decimal}>
                <EditorNumberItem value={panel.plugins.pie.value.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.pie.value.decimal = v })} />
            </PanelEditItem>
            <PanelEditItem title={t.calc} desc={t.calcTips}>
                <ValueCalculation value={panel.plugins.pie.value.calc} onChange={v => {
                    onChange((panel: Panel) => { panel.plugins.pie.value.calc = v })
                }} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title={t.interaction}>
            <PanelEditItem title={t.enable}>
                <Switch defaultChecked={panel.plugins.pie.enableClick} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.enableClick = e.currentTarget.checked
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
            <PanelEditItem title={t.onClickEvent} desc={t.onClickEventTips}>
                <CodeEditorModal value={panel.plugins.pie.onClickEvent} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.pie.onClickEvent = v
                })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Thresholds">
            <ThresholdEditor value={panel.plugins.pie.thresholds} onChange={(v) => onChange((panel: Panel) => {
                panel.plugins.pie.thresholds = v
            })} />

            <PanelEditItem title={t.enable}>
                <Switch defaultChecked={panel.plugins.pie.enableThresholds} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.enableThresholds = e.currentTarget.checked
                })} />
            </PanelEditItem>

            {panel.plugins.pie.enableThresholds && <PanelEditItem title="Show border">
                <Switch defaultChecked={panel.plugins.pie.showThreshodBorder} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.showThreshodBorder = e.currentTarget.checked
                })} />
            </PanelEditItem>}
        </PanelAccordion>
    </>
    )
})

export default PiePanelEditor

