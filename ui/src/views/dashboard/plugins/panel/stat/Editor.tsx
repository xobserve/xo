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
import { Button, HStack, Select, Switch } from "@chakra-ui/react"
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
import ThresholdEditor from "components/Threshold/ThresholdEditor"
import { SeriesData } from "types/seriesData"
import { isEmpty } from "utils/validate"
import { VarialbeAllOption } from "src/data/variable"
import { LayoutOrientation } from "types/layout"

const GraphPanelEditor = ({ panel, onChange, data }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(graphPanelMsg)
    const t2 = useStore(statsPanelMsg)

    const seriesNames = [VarialbeAllOption].concat((data.flat() as SeriesData[]).map(s => s.name))
    if (isEmpty(panel.plugins.stat.diisplaySeries)) {
        if (seriesNames?.length >= 1) {
            onChange((panel: Panel) => {
                panel.plugins.stat.diisplaySeries = seriesNames[0]
            })
        }
    } else {
        if (!seriesNames.includes(panel.plugins.stat.diisplaySeries)) {
            if (seriesNames?.length >= 1) {
                onChange((panel: Panel) => {
                    panel.plugins.stat.diisplaySeries = seriesNames[0]
                })
            }
        }
    }

    return (<>
        <PanelAccordion title={t.basicSetting}>
            <PanelEditItem title={t2.showTooltip}>
                <Switch defaultChecked={panel.plugins.stat.showTooltip} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.stat.showTooltip = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={t.series} desc={t.seriesTips}>
                <Select value={panel.plugins.stat.diisplaySeries} onChange={e => {
                    const v = e.currentTarget.value
                    onChange((panel: Panel) => {
                        panel.plugins.stat.diisplaySeries = v
                    })
                }}>
                    {seriesNames.map(name => <option value={name}>{name == VarialbeAllOption ? "All" : name}</option>)}
                </Select>
            </PanelEditItem>
            <PanelEditItem title={t2.showLegend}>
                <Switch defaultChecked={panel.plugins.stat.showLegend} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.stat.showLegend = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title={t2.showGraph}>
                <Switch defaultChecked={panel.plugins.stat.showGraph} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.stat.showGraph = e.currentTarget.checked
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
                }} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t.styles}>
            <PanelEditItem title={t.layout}>
                <RadionButtons options={Object.keys(LayoutOrientation).map(k => ({ label: LayoutOrientation[k], value: LayoutOrientation[k] }))} value={panel.plugins.stat.styles.layout} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.stat.styles.layout = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t.clorMode}>
                <RadionButtons options={[{ label: "Value", value: "value" }, { label: "Background", value: "bg-solid" }, { label: "Background gradient", value: "bg-gradient" }]} value={panel.plugins.stat.styles.colorMode} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.stat.styles.colorMode = v
                })} />
            </PanelEditItem>
            {panel.plugins.stat.styles.layout != LayoutOrientation.Horizontal &&
                <PanelEditItem title={t2.textAlign}>
                    <RadionButtons options={[{ label: t.left, value: "left" }, { label: t.center, value: "center" }]} value={panel.plugins.stat.styles.textAlign} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.stat.styles.textAlign = v
                    })} />
                </PanelEditItem>}
            <PanelEditItem title={t.type}>
                <RadionButtons options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }]} value={panel.plugins.stat.styles.style} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.stat.styles.style = v
                })} />
            </PanelEditItem>
            {panel.plugins.stat.styles.colorMode == "value" &&<PanelEditItem title={t1.opacity}>
                <EditorSliderItem value={panel.plugins.stat.styles.fillOpacity} min={0} max={100} step={1} onChange={v => {
                    onChange((panel: Panel) => {
                        panel.plugins.stat.styles.fillOpacity = v
                    })
                    dispatch(PanelForceRebuildEvent + panel.id)
                }
                } />
            </PanelEditItem>}

            <PanelEditItem title={t2.graphHeight} desc={t2.graphHeightTips}>
                <EditorSliderItem value={panel.plugins.stat.styles.graphHeight} min={0} max={100} step={5} onChange={v => {
                    onChange((panel: Panel) => {
                        panel.plugins.stat.styles.graphHeight = v
                    })
                }
                } />
            </PanelEditItem>

            <PanelEditItem title={t2.hideGraphHeight} desc={t2.hideGraphHeightTips}>
                <EditorNumberItem value={panel.plugins.stat.styles.hideGraphHeight} min={0} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.stat.styles.hideGraphHeight = v })} />
            </PanelEditItem>

            <PanelEditItem title={t1.connectNull}>
                <Switch defaultChecked={panel.plugins.stat.styles.connectNulls} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.stat.styles.connectNulls = e.currentTarget.checked
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={t.textSize}>
            <PanelEditItem title="Value">
                <EditorNumberItem value={panel.plugins.stat.textSize.value}   max={50} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.stat.textSize.value = v })} />
            </PanelEditItem>
            <PanelEditItem title="Legend">
                <EditorNumberItem value={panel.plugins.stat.textSize.legend}  max={50} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.stat.textSize.legend = v })} />
            </PanelEditItem>
        </PanelAccordion>
        {/* <PanelAccordion title={t.axis}>
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
        </PanelAccordion> */}

        <PanelAccordion title="Thresholds">
            <ThresholdEditor value={panel.plugins.stat.thresholds} onChange={(v) => onChange((panel: Panel) => {
                panel.plugins.stat.thresholds = v
            })} />
        </PanelAccordion>
    </>
    )
}

export default GraphPanelEditor
