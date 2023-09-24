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
import { Textarea } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg } from "src/i18n/locales/en"
import { PluginSettings } from "./types"
import RadionButtons from "components/RadioButtons";
import { EditorInputItem } from "components/editor/EditorItem";
import { locale } from "src/i18n/i18n";
import { defaultsDeep } from "lodash";
import { initSettings } from "../candlestick/types";

const PanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    // i18n text for common messages
    const t = useStore(commonMsg)
    // i18n country code: en or zh 
    // en for English, zh for Chinese
    // used for your own text messages
    let code = useStore(locale)
    panel.plugins[panel.type] = defaultsDeep(panel.plugins[panel.type], initSettings)
    const options: PluginSettings = panel.plugins[panel.type]
    return (<PanelAccordion title={t.basicSetting}>
        <PanelEditItem title={code == "en" ? "Text content" : "文本内容"}>
            <Textarea value={options.md} onChange={(e) => {
                const v = e.currentTarget.value
                onChange((panel: Panel) => {
                    const plugin: PluginSettings = panel.plugins[panel.type]
                    plugin.md = v
                })
            }} />
        </PanelEditItem>

        <PanelEditItem title={code == "en" ? "Horizontal position" : "水平位置"}>
            <RadionButtons options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} value={options.justifyContent} onChange={v => onChange((panel: Panel) => {
                const plugin: PluginSettings = panel.plugins[panel.type]
                plugin.justifyContent = v
            })} />

        </PanelEditItem>

        <PanelEditItem title={code == "en" ? "Vertical position" : "竖直位置"}>
            <RadionButtons options={[{ label: "Top", value: "top" }, { label: "Center", value: "center" }, { label: "Bottom", value: "end" }]} value={options.alignItems} onChange={v => onChange((panel: Panel) => {
                 const plugin: PluginSettings = panel.plugins[panel.type]
                 plugin.alignItems = v
            })} />

        </PanelEditItem>

        <PanelEditItem title="Font size">
            <EditorInputItem value={options.fontSize} onChange={v => onChange((panel: Panel) => {
                const plugin: PluginSettings = panel.plugins[panel.type]
                plugin.fontSize = v
            })} />
        </PanelEditItem>

        <PanelEditItem title="Font weight">
            <EditorInputItem value={options.fontWeight} onChange={v => onChange((panel: Panel) => {
                const plugin: PluginSettings = panel.plugins[panel.type]
                plugin.fontWeight = v
            })} />
        </PanelEditItem>
    </PanelAccordion>
    )
})

export default PanelEditor