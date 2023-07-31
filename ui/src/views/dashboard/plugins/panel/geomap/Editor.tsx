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
import { EditorInputItem } from "components/editor/EditorItem";
import { ArcGisMapServer, BaseLayerType } from "types/plugins/geoMap";

const GeoMapPanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const options = panel.plugins.geomap  
    return (<>
    <PanelAccordion title={t.basicSetting}>
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
                   Object.keys(BaseLayerType).map(k =>  <option value={BaseLayerType[k]}>{BaseLayerType[k]}</option>)
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
                   Object.keys(ArcGisMapServer).map(k =>  <option value={ArcGisMapServer[k]}>{ArcGisMapServer[k]}</option>)
                }
            </Select>
        </PanelEditItem>}

        {options.baseMap.layer == BaseLayerType.Custom && <PanelEditItem title="URL" desc="Must include {x}, {y} or {-y}, and {z} placeholders, e.g: https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/MapServer/tile/{z}/{y}/{x}">
                <EditorInputItem value={options.baseMap.url} onChange={v =>{
                      onChange((panel: Panel) => {
                        panel.plugins.geomap.baseMap.url = v
                    })
                }}/>
        </PanelEditItem>}

        {options.baseMap.layer == BaseLayerType.Custom && <PanelEditItem title="Attribution" desc="Display in the right-bottom corner,e.g: Tiles © ArcGIS">
                <EditorInputItem value={options.baseMap.attr} onChange={v =>{
                      onChange((panel: Panel) => {
                        panel.plugins.geomap.baseMap.attr = v
                    })
                }}/>
        </PanelEditItem>}
    </PanelAccordion>
    </>
    )
})

export default GeoMapPanelEditor