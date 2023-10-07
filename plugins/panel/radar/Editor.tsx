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
import { Select, Switch, Textarea } from "@chakra-ui/react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg } from "src/i18n/locales/en"
import { PluginSettings, initSettings, } from "./types"
import { dispatch } from "use-bus";
import { PanelForceRebuildEvent } from "src/data/bus-events";
import { defaultsDeep } from "lodash";
import RadionButtons from "components/RadioButtons";
import { EditorNumberItem } from "components/editor/EditorItem";


const PanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    panel.plugins[panel.type] = defaultsDeep(panel.plugins[panel.type], initSettings)
    const options: PluginSettings = panel.plugins[panel.type]
    return (
        <>
            <PanelAccordion title={t.basicSetting}>
                <PanelEditItem title={t.animation} desc={t.animationTips}>
                    <Switch defaultChecked={options.animation} onChange={e => onChange((panel: Panel) => {
                        const plugin: PluginSettings = panel.plugins[panel.type]
                        plugin.animation = e.currentTarget.checked
                        // force the panel to rebuild to avoid some problems
                        dispatch(PanelForceRebuildEvent + panel.id)
                    })} />
                </PanelEditItem>
                <PanelEditItem title={'radar.shape'}>
                    <Select value={options.radar.shape} onChange={(e) => onChange(panel => {
                        const plugin: PluginSettings = panel.plugins[panel.type]
                        plugin.radar.shape = e.currentTarget.value
                        dispatch(PanelForceRebuildEvent + panel.id)
                    })}>
                        {
                            ['polygon', 'circle'].map(i => <option value={i}>{i}</option>)
                        }
                    </Select>
                </PanelEditItem>
            </PanelAccordion>
            <PanelAccordion title={'Legend'}>
                <PanelEditItem title={t.mode}>
                    <RadionButtons options={[{ label: "Show", value: true }, { label: "Hidden", value: false }]} value={options.graph.legend.mode} onChange={v => onChange((panel: Panel) => {
                        const plugin: PluginSettings = panel.plugins[panel.type]
                        plugin.graph.legend.mode = v
                        dispatch(PanelForceRebuildEvent + panel.id)
                    })} />
                </PanelEditItem>
                <PanelEditItem title="orient">
                    <Select value={options.graph.legend.orient} onChange={e => onChange(panel => {
                        const plugin: PluginSettings = panel.plugins[panel.type]
                        plugin.graph.legend.orient = e.currentTarget.value
                        dispatch(PanelForceRebuildEvent + panel.id)
                    })}>
                        {['horizontal', 'vertical'].map(i => <option value={i}>{i}</option>)}
                    </Select>
                </PanelEditItem>
                <PanelEditItem title={'top'}>
                    <EditorNumberItem value={options.graph.legend.top} onChange={(e) => {
                        const plugin: PluginSettings = panel.plugins[panel.type]
                        plugin.graph.legend.top = e
                        dispatch(PanelForceRebuildEvent + panel.id)
                    }} />
                </PanelEditItem>
                <PanelEditItem title={'bottom'}>
                    <EditorNumberItem value={options.graph.legend.bottom} onChange={(e) => {
                        const plugin: PluginSettings = panel.plugins[panel.type]
                        plugin.graph.legend.bottom = e
                        dispatch(PanelForceRebuildEvent + panel.id)
                    }} />
                </PanelEditItem>
                <PanelEditItem title={'left'}>
                    <EditorNumberItem value={options.graph.legend.left} onChange={(e) => {
                        const plugin: PluginSettings = panel.plugins[panel.type]
                        plugin.graph.legend.left = e
                        dispatch(PanelForceRebuildEvent + panel.id)
                    }} />
                </PanelEditItem>
                <PanelEditItem title={'right'}>
                    <EditorNumberItem value={options.graph.legend.right} onChange={(e) => {
                        const plugin: PluginSettings = panel.plugins[panel.type]
                        plugin.graph.legend.right = e
                        dispatch(PanelForceRebuildEvent + panel.id)
                    }} />
                </PanelEditItem>
                <PanelEditItem title={'itemGap'}>
                    <EditorNumberItem value={options.graph.legend.itemGap} onChange={(e) => {
                        const plugin: PluginSettings = panel.plugins[panel.type]
                        plugin.graph.legend.itemGap = e
                        dispatch(PanelForceRebuildEvent + panel.id)
                    }} />
                </PanelEditItem>
            </PanelAccordion >
        </>
    )
})

export default PanelEditor