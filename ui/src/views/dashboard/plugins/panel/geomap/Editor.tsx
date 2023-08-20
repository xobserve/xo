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
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg } from "src/i18n/locales/en"
import { Select } from "@chakra-ui/select";
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem";
import { ArcGisMapServer, BaseLayerType, DataLayerType } from "types/plugins/geoMap";
import RadionButtons from "components/RadioButtons";
import ThresholdEditor from "components/Threshold/ThresholdEditor";
import countries from 'public/plugins/panel/geomap/countries.json'
import { Button, HStack, Switch, Text } from "@chakra-ui/react";
import { geomap } from "./GeoMap";
import { toLonLat } from "ol/proj";
import { round } from "lodash";
import { UnitPicker } from "components/Unit";
import { Units } from "types/panel/plugins";
import ValueCalculation from "components/ValueCalculation";
import { dispatch } from "use-bus";
import { PanelForceRebuildEvent } from "src/data/bus-events";
import { CodeEditorModal } from "components/CodeEditor/CodeEditorModal";

const GeoMapPanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const options = panel.plugins.geomap
    return (<>
        <PanelAccordion title={t.basicSetting}>
            <PanelEditItem title="Initial view" desc="The loation shows when map first loads">
                <HStack>
                    <Text fontSize="0.8rem" width="80px">Longitude</Text>
                    <EditorNumberItem notNull key={options.initialView.center[0]} value={options.initialView.center[0]} min={-180} max={180} step={0.1} onChange={v => {
                        onChange((panel: Panel) => {
                            panel.plugins.geomap.initialView.center[0] = v
                        })
                    }} />
                </HStack>
                <HStack>
                    <Text fontSize="0.8rem" width="80px">Latitude</Text>
                    <EditorNumberItem notNull key={options.initialView.center[1]} value={options.initialView.center[1]} min={-90} max={90} step={0.1} onChange={v => {
                        onChange((panel: Panel) => {
                            panel.plugins.geomap.initialView.center[1] = v
                        })
                    }} />
                </HStack>
                <HStack>
                    <Text fontSize="0.8rem" width="80px">Zoom</Text>
                    <EditorNumberItem notNull key={options.initialView.zoom} value={options.initialView.zoom} min={1} max={18} step={1} onChange={v => {
                        onChange((panel: Panel) => {
                            panel.plugins.geomap.initialView.zoom = v
                        })
                    }} />
                </HStack>
            </PanelEditItem>
            <PanelEditItem title="Use current view" desc="Use the location coordinates you are currently zooming in">
                <Button size="sm" onClick={() => {
                    if (geomap) {
                        const view = geomap.getView()
                        const center = toLonLat(view.getCenter())
                        const zoom = view.getZoom()
                        onChange((panel: Panel) => {
                            panel.plugins.geomap.initialView.center = [round(center[0], 3), round(center[1], 3)]
                            panel.plugins.geomap.initialView.zoom = round(zoom, 3)
                        })
                    }

                }}>Use current view</Button>
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Data layer">
            <PanelEditItem title="Layer" desc="Render data on specific layer which is above base map, different data lay has different rendering effects">
                <RadionButtons options={Object.keys(DataLayerType).map(k => ({ label: k, value: DataLayerType[k] }))} value={options.dataLayer.layer} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.geomap.dataLayer.layer = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t.opacity}>
                <EditorSliderItem value={options.dataLayer.opacity} min={0} max={1} step={0.1} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.geomap.dataLayer.opacity = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Base map layer">
            <PanelEditItem title="Layer" desc="Dispaly the base map you are seeing in the panel">
                <Select value={options.baseMap.layer} onChange={e => {
                    const v = e.target.value
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.baseMap.layer = v as BaseLayerType
                    })
                }}>
                    {
                        Object.keys(BaseLayerType).map(k => <option value={BaseLayerType[k]}>{BaseLayerType[k]}</option>)
                    }
                </Select>
            </PanelEditItem>

            {options.baseMap.layer == BaseLayerType.ArcGis && <PanelEditItem title="Map server" desc="Choose the server to get data(png) for rendering map">
                <Select value={options.baseMap.mapServer} onChange={e => {
                    const v = e.target.value
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.baseMap.mapServer = v as ArcGisMapServer
                    })
                }}>
                    {
                        Object.keys(ArcGisMapServer).map(k => <option value={ArcGisMapServer[k]}>{ArcGisMapServer[k]}</option>)
                    }
                </Select>
            </PanelEditItem>}

            {options.baseMap.layer == BaseLayerType.Custom && <PanelEditItem title="URL" desc="Must include {x}, {y} or {-y}, and {z} placeholders, e.g: https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/MapServer/tile/{z}/{y}/{x}">
                <EditorInputItem value={options.baseMap.url} onChange={v => {
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.baseMap.url = v
                    })
                }} />
            </PanelEditItem>}

            {options.baseMap.layer == BaseLayerType.Custom && <PanelEditItem title="Attribution" desc="Display in the right-bottom corner,e.g: Tiles © ArcGIS">
                <EditorInputItem value={options.baseMap.attr} onChange={v => {
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.baseMap.attr = v
                    })
                }} />
            </PanelEditItem>}
        </PanelAccordion>
        <PanelAccordion title="Map controls">
            <PanelEditItem title="Enable zoom" desc="Enable zoom via mouse wheel">
                <Switch isChecked={options.controls.enableZoom} onChange={e => {
                    const v = e.target.checked
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.controls.enableZoom = v
                    })
                }} />
            </PanelEditItem>
            <PanelEditItem title="Show zoom button" desc="Display zoom button in upper left corner">
                <Switch isChecked={options.controls.showZoom} onChange={e => {
                    const v = e.target.checked
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.controls.showZoom = v
                    })
                }} />
            </PanelEditItem>
            <PanelEditItem title="Show attribution" desc="Display map source attribution in the lower right corner">
                <Switch isChecked={options.controls.showAttribution} onChange={e => {
                    const v = e.target.checked
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.controls.showAttribution = v
                    })
                }} />
            </PanelEditItem>
            <PanelEditItem title="Show scale" desc="Display map scale info  in the lower left corner">
                <Switch isChecked={options.controls.showScale} onChange={e => {
                    const v = e.target.checked
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.controls.showScale = v
                    })
                }} />
            </PanelEditItem>
            <PanelEditItem title="Show tooltip">
                <Switch isChecked={options.controls.showTooltip} onChange={e => {
                    const v = e.target.checked
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.controls.showTooltip = v
                    })
                }} />
            </PanelEditItem>
            {/* <PanelEditItem title="Show measure tools" desc="Display map measure tools in the upper right corner">
                <Switch isChecked={options.controls.showMeasure} onChange={e => {
                    const v = e.target.checked
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.controls.showMeasure = v
                    })
                }} />
            </PanelEditItem> */}
            {/* <PanelEditItem title="Show debug" desc="Display map debug info on the right">
                <Switch isChecked={options.controls.showDebug} onChange={e => {
                    const v = e.target.checked
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.controls.showDebug = v
                    })
                }} />
            </PanelEditItem> */}
        </PanelAccordion>

        <PanelAccordion title="Value">
            <PanelEditItem title={t.unit}>
                <UnitPicker value={panel.plugins.geomap.value} onChange={
                    (v: Units) => onChange((panel: Panel) => {
                        panel.plugins.geomap.value.units = v.units
                        panel.plugins.geomap.value.unitsType = v.unitsType
                    })

                    // onPanelChange(units, type)
                } />
            </PanelEditItem>
            <PanelEditItem title={t.decimal}>
                <EditorNumberItem value={panel.plugins.geomap.value.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.geomap.value.decimal = v })} />
            </PanelEditItem>
            <PanelEditItem title={t.calc} desc={t.calcTips}>
                <ValueCalculation value={panel.plugins.geomap.value.calc} onChange={v => {
                    onChange((panel: Panel) => { panel.plugins.geomap.value.calc = v })
                }} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Circle size">
            <PanelEditItem title="Enable size scale" desc="When enabled, circle size will depend on its value: bigger balue means larger size">
                <Switch isChecked={options.sizeScale.enable} onChange={e => {
                    const v = e.target.checked
                    onChange((panel: Panel) => {
                        panel.plugins.geomap.sizeScale.enable = v
                    })
                    dispatch(PanelForceRebuildEvent + panel.id)
                }} />
            </PanelEditItem>
            <PanelEditItem title="Circle base size" desc="In Css pixels, base size is also min size">
                <EditorNumberItem value={panel.plugins.geomap.sizeScale.baseSize} min={1} max={50} step={1} onChange={v => onChange((panel: Panel) => { 
                    panel.plugins.geomap.sizeScale.baseSize = v 
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
            <PanelEditItem title="Max scale" desc="maxCircleSize = baseSize * maxScale, if base size is 10, maxScale is 4, then max size will not exceed 40 ">
                <EditorNumberItem value={panel.plugins.geomap.sizeScale.maxScale} min={1} max={50} step={1} onChange={v => onChange((panel: Panel) => { 
                    panel.plugins.geomap.sizeScale.maxScale = v 
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title={t.interaction}>
            <PanelEditItem title={t.enable}>
                <Switch defaultChecked={panel.plugins.geomap.enableClick} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.geomap.enableClick = e.currentTarget.checked
                    // dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
            <PanelEditItem title={t.onClickEvent} desc={t.onClickEventTips}>
                <CodeEditorModal value={panel.plugins.geomap.onClickEvent} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.geomap.onClickEvent = v
                })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Thresholds">
            <ThresholdEditor value={panel.plugins.geomap.thresholds} onChange={(v) => onChange((panel: Panel) => {
                panel.plugins.geomap.thresholds = v
            })} />
        </PanelAccordion>
    </>
    )
})

export default GeoMapPanelEditor
// showZoom: boolean
// showAttribution: boolean
// showScale: boolean
// showDebug: boolean
// showMeasure: boolean
// showTooltip: boolean

const InitialViewEditor = ({ value, onChange }) => {
    return <div>
        <div>Location</div>
        <div>Zoom</div>
    </div>
}