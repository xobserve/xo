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
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem"
import RadionButtons from "components/RadioButtons"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, graphPanelMsg } from "src/i18n/locales/en"
import { UnitPicker } from "components/Unit"
import { Units } from "types/panel/plugins"
import PopoverSelect from "components/select/PopoverSelect"
import { ValueCalculationType } from "types/value"

const BarPanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(graphPanelMsg)
    return (<>
        <PanelAccordion title={t.basic}>
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
        </PanelAccordion>
        <PanelAccordion title="Legend">
            <PanelEditItem title={t.show}>
                <Switch defaultChecked={panel.plugins.bar.legend.show} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.bar.legend.show = e.currentTarget.checked
                })} />

            </PanelEditItem>
            {panel.plugins.bar.legend.show && <>
                <PanelEditItem title={t1.placement}>
                    <RadionButtons options={[{ label: "Bottom", value: "bottom" }, { label: "Right", value: "right" }]} value={panel.plugins.bar.legend.placement} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.bar.legend.placement = v
                    })} />
                </PanelEditItem>
                {panel.plugins.bar.legend.placement == "right" && <PanelEditItem title={t1.width}>
                    <EditorNumberItem value={panel.plugins.bar.legend.width} min={100} step={50} onChange={v => onChange((panel: Panel) => { panel.plugins.bar.legend.width = (v <= 100 ? 100 : v) })} />
                </PanelEditItem>}
                {panel.plugins.bar.legend.placement == "right" && <PanelEditItem title={t1.nameWidth} desc={t1.nameWidthTips}>
                    <EditorInputItem value={panel.plugins.bar.legend.nameWidth} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.bar.legend.nameWidth = v
                    })} />
                </PanelEditItem>}
                <PanelEditItem title={t1.values} desc={t1.valuesTips}>
                    <PopoverSelect value={panel.plugins.bar.legend.valueCalcs} isMulti options={Object.keys(ValueCalculationType).map(k => ({ label: k, value: k }))} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.bar.legend.valueCalcs = v as any
                    })} />
                </PanelEditItem>
            </>}
        </PanelAccordion>
        <PanelAccordion title={t.styles}>
            <PanelEditItem title="Bar width">
                <EditorNumberItem value={panel.plugins.bar.styles.barWidth} min={1}  max={100} step={2} onChange={v => onChange((panel: Panel) => { panel.plugins.bar.styles.barWidth = v })} placeholder="auto" />
            </PanelEditItem>  
            <PanelEditItem title="Axis font size">
                <EditorNumberItem value={panel.plugins.bar.styles.axisFontSize} min={6}  max={20} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.bar.styles.axisFontSize = v })} placeholder="auto" />
            </PanelEditItem> 
            <PanelEditItem title="Label font size">
                <EditorNumberItem value={panel.plugins.bar.styles.labelFontSize} min={6}  max={20} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.bar.styles.labelFontSize = v })} placeholder="auto" />
            </PanelEditItem>
            <PanelEditItem title="Bar fill opacity">
                <EditorSliderItem value={panel.plugins.bar.styles.barOpacity} min={0}  max={100} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.bar.styles.barOpacity = v })}  />
            </PanelEditItem>      
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