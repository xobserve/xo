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
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import RadionButtons from "components/RadioButtons"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, textPanelMsg } from "src/i18n/locales/en"
import { Select } from "antd"
import { datasources } from "src/App"
import { datasourceSupportAlerts } from "src/data/alerts"
import { dispatch } from "use-bus"
import { PanelForceRebuildEvent } from "src/data/bus-events"

const AlertPanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    return (<><PanelAccordion title={t.basic}>
        <PanelEditItem title="Order by">
            <RadionButtons options={[{ label: "Newest First", value: "newest" }, { label: "Oldest First", value: "oldest" }]} value={panel.plugins.alert.orderBy} onChange={v => onChange((panel: Panel) => {
                panel.plugins.alert.orderBy = v
            })} />
        </PanelEditItem>
    </PanelAccordion>
        <PanelAccordion title="Toolbar">
            <PanelEditItem title="Show" desc="Show toolbar in upper right corner">
                <Switch isChecked={panel.plugins.alert.toolbar.show} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.alert.toolbar.show = e.target.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Toolbar width" desc="In css pixels">
                <EditorNumberItem min={0} max={500} step={20} value={panel.plugins.alert.toolbar.width} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.alert.toolbar.width = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Filter">
            <PanelEditItem title="Datasource" desc="Query alerts from these datasources">  
                <Select style={{minWidth: "300px"}} value={panel.plugins.alert.filter.datasources} allowClear mode="multiple" options={
                    datasources.filter(ds => datasourceSupportAlerts.includes(ds.type)).map(ds => ({label: ds.name, value: ds.id}))} onChange={
                    (v) => {
                    onChange((panel: Panel) => {
                        panel.plugins.alert.filter.datasources = v
                    });
                    dispatch(PanelForceRebuildEvent + panel.id)
                }
                } />
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Chart">
            <PanelEditItem title="Show">
                <Switch isChecked={panel.plugins.alert.chart.show} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.alert.chart.show = e.target.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Chart height" desc="Css style width">
                <EditorInputItem value={panel.plugins.alert.chart.height} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.alert.chart.height = v
                })} placeholder="e.g 200px 30%" />
            </PanelEditItem>
            <PanelEditItem title="Show label" desc="Value label display on bars">
                <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: 'always' }, { label: "None", value: 'none' }]} value={panel.plugins.alert.chart.showLabel} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.alert.chart.showLabel = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Stack">
                <RadionButtons options={[{ label: "Auto", value: "auto" }, { label: "Always", value: 'always' }, { label: "None", value: 'none' }]} value={panel.plugins.alert.chart.stack} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.alert.chart.stack = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Tooltip">
                <RadionButtons options={[{ label: "Single", value: "single" }, { label: "All", value: "all" }, { label: "None", value: "none" }]} value={panel.plugins.alert.chart.tooltip} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.alert.chart.tooltip = v
                })} />
            </PanelEditItem>
        </PanelAccordion>
    </>
    )
})

export default AlertPanelEditor