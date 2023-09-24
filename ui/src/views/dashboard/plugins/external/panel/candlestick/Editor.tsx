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
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, textPanelMsg } from "src/i18n/locales/en"
import { PluginSettings, initSettings } from "./types"
import { EditorInputItem } from "components/editor/EditorItem";
import { dispatch } from "use-bus";
import { PanelForceRebuildEvent } from "src/data/bus-events";
import { defaultsDeep } from "lodash";
import RadionButtons from "components/RadioButtons";

const PanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    panel.plugins[panel.type] = defaultsDeep(panel.plugins[panel.type], initSettings)
    const options: PluginSettings = panel.plugins[panel.type]
    return (<>
        <PanelAccordion title={t.basicSetting}>
            <PanelEditItem title={t.animation} desc={t.animationTips}>
                <Switch defaultChecked={options.animation} onChange={e => onChange((panel: Panel) => {
                    const plugin: PluginSettings = panel.plugins[panel.type]
                    plugin.animation = e.currentTarget.checked
                    // force the panel to rebuild to avoid some problems
                    // we can also clone the props.data in Panel.tsx to resolve this problem, but it will cause performance issues
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
            {/* <PanelEditItem title="Title">
            <EditorInputItem value={options.title} onChange={v => onChange((panel: Panel) => {
                const plugin: PluginSettings = panel.plugins[panel.type]
                plugin.title = v
                dispatch(PanelForceRebuildEvent + panel.id)
            })} />
        </PanelEditItem> */}
        </PanelAccordion>
        <PanelAccordion title={"Mark on chart"} >
            <PanelEditItem title="Max point">
                <RadionButtons options={[{ label: "None", value: "none" }, { label: "Highest", value: "highest" }, { label: "Close", value: "close" }]} value={options.mark.maxPoint} onChange={v => onChange((panel: Panel) => {
                    const plugin: PluginSettings = panel.plugins[panel.type]
                    plugin.mark.maxPoint = v
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
            <PanelEditItem title="Min point">
                <RadionButtons options={[{ label: "None", value: "none" }, { label: "Lowest", value: "lowest" }, { label: "Open", value: "open" }]} value={options.mark.minPoint} onChange={v => onChange((panel: Panel) => {
                    const plugin: PluginSettings = panel.plugins[panel.type]
                    plugin.mark.minPoint = v
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
            <PanelEditItem title="Min Line">
                <RadionButtons options={[{ label: "None", value: "none" }, { label: "Lowest", value: "lowest" }, { label: "Open", value: "open" }]} value={options.mark.minLine} onChange={v => onChange((panel: Panel) => {
                    const plugin: PluginSettings = panel.plugins[panel.type]
                    plugin.mark.minLine = v
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
            <PanelEditItem title="Max Line">
                <RadionButtons options={[{ label: "None", value: "none" }, { label: "Highest", value: "highest" }, { label: "Close", value: "close" }]} value={options.mark.maxLine} onChange={v => onChange((panel: Panel) => {
                    const plugin: PluginSettings = panel.plugins[panel.type]
                    plugin.mark.maxLine = v
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title={"MA line"} >
            <PanelEditItem title={"MA5"}>
                <Switch defaultChecked={options.maLine.ma5} onChange={e => onChange((panel: Panel) => {
                    const plugin: PluginSettings = panel.plugins[panel.type]
                    plugin.maLine.ma5 = e.currentTarget.checked
                    // force the panel to rebuild to avoid some problems
                    // we can also clone the props.data in Panel.tsx to resolve this problem, but it will cause performance issues
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
            <PanelEditItem title={"MA10"}>
                <Switch defaultChecked={options.maLine.ma10} onChange={e => onChange((panel: Panel) => {
                    const plugin: PluginSettings = panel.plugins[panel.type]
                    plugin.maLine.ma10 = e.currentTarget.checked
                    // force the panel to rebuild to avoid some problems
                    // we can also clone the props.data in Panel.tsx to resolve this problem, but it will cause performance issues
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
            <PanelEditItem title={"MA20"}>
                <Switch defaultChecked={options.maLine.ma20} onChange={e => onChange((panel: Panel) => {
                    const plugin: PluginSettings = panel.plugins[panel.type]
                    plugin.maLine.ma20 = e.currentTarget.checked
                    // force the panel to rebuild to avoid some problems
                    // we can also clone the props.data in Panel.tsx to resolve this problem, but it will cause performance issues
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
            <PanelEditItem title={"MA30"}>
                <Switch defaultChecked={options.maLine.ma30} onChange={e => onChange((panel: Panel) => {
                    const plugin: PluginSettings = panel.plugins[panel.type]
                    plugin.maLine.ma30 = e.currentTarget.checked
                    // force the panel to rebuild to avoid some problems
                    // we can also clone the props.data in Panel.tsx to resolve this problem, but it will cause performance issues
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
        </PanelAccordion>
    </>
    )
})

export default PanelEditor