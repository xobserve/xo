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
import { Button, HStack, Switch } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import RadionButtons from "components/RadioButtons"
import { UnitPicker } from "components/Unit"
import { Panel, PanelEditorProps } from "types/dashboard"
import { EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem"
import { ColorPicker } from "components/ColorPicker"
import { dispatch } from "use-bus"
import { PanelForceRebuildEvent } from "src/data/bus-events"
import ValueCalculation from "components/ValueCalculation"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, graphPanelMsg, statsPanelMsg } from "src/i18n/locales/en"

const GraphPanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(graphPanelMsg)
    const t2 = useStore(statsPanelMsg)
    return (<>
        <PanelAccordion title={t.basicSetting}>
            <PanelEditItem title={t2.showTooltip}>
                <Switch defaultChecked={panel.plugins.stat.showTooltip} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.stat.showTooltip = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={t2.showLegend}>
                <Switch defaultChecked={panel.plugins.stat.showLegend} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.stat.showLegend = e.currentTarget.checked
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t.value}>
            <PanelEditItem title={t.unit}>
                <UnitPicker type={panel.plugins.stat.value.unitsType} value={panel.plugins.stat.value.units} onChange={
                    (units, type) => onChange((panel: Panel) => {
                        panel.plugins.stat.value.units = units
                        panel.plugins.stat.value.unitsType = type
                    })
                } />
            </PanelEditItem>
            <PanelEditItem title={t.decimal}>
                <EditorNumberItem value={panel.plugins.stat.value.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.stat.value.decimal = v })} />
            </PanelEditItem>
            <PanelEditItem title={t.calc} desc={t.calcTips}>
                <ValueCalculation value={panel.plugins.stat.value.calc} onChange={v => {
                    onChange((panel: Panel) => { panel.plugins.stat.value.calc = v })
                }}/>
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t.styles}>
            <PanelEditItem title={t.type}>
                <RadionButtons options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }]} value={panel.plugins.stat.styles.style} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.stat.styles.style = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t1.gradient}>
                <RadionButtons options={[{ label: "None", value: "none" }, { label: "Opacity", value: "opacity" }]} value={panel.plugins.stat.styles.gradientMode} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.stat.styles.gradientMode = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t1.opacity}>
                <EditorSliderItem value={panel.plugins.stat.styles.fillOpacity} min={0} max={100} step={1} onChange={v => {
                    onChange((panel: Panel) => {
                        panel.plugins.stat.styles.fillOpacity = v
                    })
                    dispatch(PanelForceRebuildEvent + panel.id)
                }
                } />
            </PanelEditItem>
            <PanelEditItem title={t.color}>
                <ColorPicker  color={panel.plugins.stat.styles.color} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.stat.styles.color = v
                })} />
            </PanelEditItem>

            <PanelEditItem title={t2.graphHeight} desc={t2.graphHeightTips}>
                <EditorSliderItem value={panel.plugins.stat.styles.graphHeight} min={0} max={100} step={5} onChange={v => {
                    onChange((panel: Panel) => {
                        panel.plugins.stat.styles.graphHeight = v
                    })
                }
                } />
            </PanelEditItem>

            <PanelEditItem title={t1.connectNull}>
                <Switch defaultChecked={panel.plugins.stat.styles.connectNulls} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.stat.styles.connectNulls = e.currentTarget.checked
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t.axis}>
            <PanelEditItem title={t.scale}>
                <HStack spacing="1">
                    <RadionButtons options={[{ label: "Linear", value: "linear" }, { label: "Log", value: "log" }]} value={panel.plugins.stat.axisY.scale} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.stat.axisY.scale = v
                    })} />
                </HStack>
            </PanelEditItem>

            {panel.plugins.stat.axisY.scale == "log" && <PanelEditItem title="Scale base">
                <RadionButtons options={[{ label: "Base 2", value: "2" }, { label: "Base 10", value: "10" }]} value={panel.plugins.stat.axisY.scaleBase as any} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.stat.axisY.scaleBase = v
                })} />
            </PanelEditItem>}
        </PanelAccordion>
    </>
    )
}

export default GraphPanelEditor
