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
import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Select, Switch, useDisclosure } from "@chakra-ui/react"
import CodeEditor from "components/CodeEditor/CodeEditor"
import RadionButtons from "components/RadioButtons"
import ValueCalculation from "components/ValueCalculation"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import { UnitPicker } from "components/Unit"
import { memo, useState } from "react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import { PieLegendPlacement, Units } from "types/panel/plugins"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, piePanelMsg } from "src/i18n/locales/en"
import ThresholdEditor from "components/Threshold/ThresholdEditor"
import { CodeEditorModal } from "components/CodeEditor/CodeEditorModal"

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

            <PanelEditItem title={t1.showLabel}>
                <Switch defaultChecked={panel.plugins.pie.showLabel} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.showLabel = e.currentTarget.checked
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

        </PanelAccordion>

        <PanelAccordion title="Value">
            <PanelEditItem title={t.unit}>
                <UnitPicker value={panel.plugins.pie.value} onChange={
                    (v:Units) => onChange((panel: Panel) => {
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
        </PanelAccordion>
    </>
    )
})

export default PiePanelEditor

