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
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import RadionButtons from "components/RadioButtons"
import { UnitPicker } from "components/Unit"
import { Panel, PanelEditorProps } from "types/dashboard"
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem"
import { dispatch } from "use-bus"
import { PanelForceRebuildEvent } from "src/data/bus-events"
import PopoverSelect from "components/select/PopoverSelect"
import { ValueCalculationType } from "types/value"
import React from "react";
import { commonMsg, graphPanelMsg } from "src/i18n/locales/en"
import { useStore } from "@nanostores/react"
import ThresholdEditor from "components/Threshold/ThresholdEditor"
import { ThresholdDisplay, Units } from "types/panel/plugins"

const GraphPanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(graphPanelMsg)

    return (<>
        <PanelAccordion title="Tooltip">
            <PanelEditItem title={t.mode}>
                <RadionButtons options={[{ label: "Single", value: "single" }, { label: "All", value: "all" }, { label: "Hidden", value: "hidden" }]} value={panel.plugins.graph.tooltip.mode} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.tooltip.mode = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Legend">
            <PanelEditItem title={t.mode}>
                <RadionButtons options={[{ label: "Table", value: "table" }, { label: "Hidden", value: "hidden" }]} value={panel.plugins.graph.legend.mode} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.legend.mode = v
                })} />

            </PanelEditItem>
            {panel.plugins.graph.legend.mode != 'hidden' && <>
                <PanelEditItem title={t1.placement}>
                    <RadionButtons options={[{ label: "Bottom", value: "bottom" }, { label: "Right", value: "right" }]} value={panel.plugins.graph.legend.placement} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.graph.legend.placement = v
                    })} />
                </PanelEditItem>
                {panel.plugins.graph.legend.placement == "right" && <PanelEditItem title={t1.width}>
                    <EditorNumberItem value={panel.plugins.graph.legend.width} min={100} step={50} onChange={v => onChange((panel: Panel) => { panel.plugins.graph.legend.width = (v <= 100 ? 100 : v) })} />
                </PanelEditItem>}
                {panel.plugins.graph.legend.placement == "right" && <PanelEditItem title={t1.nameWidth} desc={t1.nameWidthTips}>
                    <EditorInputItem value={panel.plugins.graph.legend.nameWidth} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.graph.legend.nameWidth = v
                    })} />
                </PanelEditItem>}
                <PanelEditItem title={t1.values} desc={t1.valuesTips}>
                    <PopoverSelect value={panel.plugins.graph.legend.valueCalcs} isMulti options={Object.keys(ValueCalculationType).map(k => ({ label: k, value: k }))} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.graph.legend.valueCalcs = v as any
                    })} />
                </PanelEditItem>
            </>}
        </PanelAccordion>
        <PanelAccordion title={t1.graphStyles}>
            <PanelEditItem title={t.type}>
                <RadionButtons options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }, { label: "points", value: "points" }]} value={panel.plugins.graph.styles.style} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.styles.style = v
                })} />
            </PanelEditItem>
            {
                 panel.plugins.graph.styles.style == "bars" && <>
                     <PanelEditItem title={t1.barRadius}>
                        <EditorNumberItem value={panel.plugins.graph.styles.barRadius} min={0} max={0.5} step={0.1} onChange={v => onChange((panel: Panel) => {
                            panel.plugins.graph.styles.barRadius = v
                            dispatch(PanelForceRebuildEvent + panel.id)
                        })} />
                    </PanelEditItem>
                    <PanelEditItem title={t1.barGap}>
                        <EditorNumberItem value={panel.plugins.graph.styles.barGap} min={0} max={100} step={5} onChange={v => onChange((panel: Panel) => {
                            panel.plugins.graph.styles.barGap = v
                            dispatch(PanelForceRebuildEvent + panel.id)
                        })} />
                    </PanelEditItem>
                 </>
            }
            {panel.plugins.graph.styles.style != "points" &&
                <>
                    <PanelEditItem title={t1.lineWidth}>
                        <EditorSliderItem value={panel.plugins.graph.styles.lineWidth} min={0} max={10} step={1} onChange={v => onChange((panel: Panel) => {
                            panel.plugins.graph.styles.lineWidth = v
                        })} />
                    </PanelEditItem>
                    <PanelEditItem title={t1.gradient}>
                        <RadionButtons options={[{ label: "None", value: "none" }, { label: "Opacity", value: "opacity" }]} value={panel.plugins.graph.styles.gradientMode} onChange={v => onChange((panel: Panel) => {
                            panel.plugins.graph.styles.gradientMode = v
                        })} />
                    </PanelEditItem>
                    <PanelEditItem title={t1.opacity}>
                        <EditorSliderItem value={panel.plugins.graph.styles.fillOpacity} min={0} max={100} step={1} onChange={v => {
                            onChange((panel: Panel) => {
                                panel.plugins.graph.styles.fillOpacity = v
                            })
                            dispatch(PanelForceRebuildEvent + panel.id)
                        }
                        } />
                    </PanelEditItem>

                    <PanelEditItem title={t1.showPoints}>
                        <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: "always" }, { label: "Never", value: "never" }]} value={panel.plugins.graph.styles.showPoints} onChange={v => onChange((panel: Panel) => {
                            panel.plugins.graph.styles.showPoints = v
                        })} />
                    </PanelEditItem>
                </>}
       
            <PanelEditItem title={t1.pointSize}>
                <EditorSliderItem value={panel.plugins.graph.styles.pointSize} min={1} max={20} step={1} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.styles.pointSize = v
                })} />
            </PanelEditItem>

            <PanelEditItem title={t1.connectNull}>
                <Switch defaultChecked={panel.plugins.graph.styles.connectNulls} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.graph.styles.connectNulls = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Stack">
            <Switch defaultChecked={panel.plugins.graph.styles.enableStack} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.graph.styles.enableStack = e.currentTarget.checked
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t.axis}>
            <PanelEditItem title={t.label}>
                <EditorInputItem value={panel.plugins.graph.axis.label} onChange={v =>
                    onChange((panel: Panel) => {
                        panel.plugins.graph.axis.label = v
                    })
                } />
            </PanelEditItem>
            <PanelEditItem title={t1.showGrid}>
                <RadionButtons options={[{ label: "Show", value: true }, { label: "Hidden", value: false }]} value={panel.plugins.graph.axis.showGrid} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.axis.showGrid = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t.scale}>
                <RadionButtons options={[{ label: "Linear", value: "linear" }, { label: "Log", value: "log" }]} value={panel.plugins.graph.axis.scale} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.axis.scale = v
                })} />
            </PanelEditItem>
            {panel.plugins.graph.axis.scale == "log" && <PanelEditItem title="Scale Base">
                <RadionButtons options={[{ label: "Base 2", value: "2" }, { label: "Base 10", value: "10" }]} value={panel.plugins.graph.axis.scaleBase as any} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.graph.axis.scaleBase = v
                })} />
            </PanelEditItem>}
        </PanelAccordion>

        <PanelAccordion title="Value">
            <PanelEditItem title={t.unit}>
                <UnitPicker value={panel.plugins.graph.value} onChange={
                    (v:Units) => onChange((panel: Panel) => {
                        panel.plugins.graph.value.units = v.units
                        panel.plugins.graph.value.unitsType = v.unitsType
                    })

                    // onPanelChange(units, type)
                } />
            </PanelEditItem>
            <PanelEditItem title={t.decimal}>
                <EditorNumberItem value={panel.plugins.graph.value.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.graph.value.decimal = v })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Thresholds">
            <ThresholdEditor value={panel.plugins.graph.thresholds} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.graph.thresholds = v
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            
            <PanelEditItem title={t1.thresholdsDisplay}>
                <Select value={panel.plugins.graph.thresholdsDisplay} onChange={e => {
                    const v = e.currentTarget.value
                    onChange((panel: Panel) => {
                        panel.plugins.graph.thresholdsDisplay = v as ThresholdDisplay
                        dispatch(PanelForceRebuildEvent + panel.id)
                    })
                }}>
                   {
                    Object.keys(ThresholdDisplay).map(k => 
                        <option value={ThresholdDisplay[k]}>{ThresholdDisplay[k]}</option>
                    )
                   }
                </Select>
            </PanelEditItem>
        </PanelAccordion>
    </>
    )
}

export default GraphPanelEditor
