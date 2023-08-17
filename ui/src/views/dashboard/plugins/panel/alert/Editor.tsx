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
import { Box, Button, Switch, Textarea } from "@chakra-ui/react"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import RadionButtons from "components/RadioButtons"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { DatasourceType, Panel, PanelEditorProps } from "types/dashboard"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { commonMsg } from "src/i18n/locales/en"
import { Select } from "antd"
import { datasources } from "src/App"
import { datasourceSupportAlerts } from "src/data/alerts"
import { dispatch } from "use-bus"
import { PanelForceRebuildEvent } from "src/data/bus-events"
import { AlertState } from "types/alert"
import MultiRadionButtons from "components/MultiRadioButtons"
import { ColorPicker } from "components/ColorPicker"
import { LayoutOrientation } from "types/layout"
import { ResetPanelToolbalEvent, ResetPanelToolbalViewModeEvent } from "./Alert"
import { ClickActionsEditor } from "src/views/dashboard/edit-panel/components/ClickActionsEditor"
import HttpQueryEditor from "../../datasource/http/QueryEditor"

const AlertPanelEditor = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    return (<><PanelAccordion title={t.basic}>
        <PanelEditItem title="View mode">
            <RadionButtons options={[{ label: "List", value: "list" }, { label: "Stat", value: "stat" }]} value={panel.plugins.alert.viewMode} onChange={v => onChange((panel: Panel) => {
                panel.plugins.alert.viewMode = v
                dispatch(ResetPanelToolbalViewModeEvent + panel.id)
            })} />
        </PanelEditItem>
        {panel.plugins.alert.viewMode === "stat" && <>
            <PanelEditItem title="Show stat graph">
                <Switch isChecked={panel.plugins.alert.stat.showGraph} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.alert.stat.showGraph = e.target.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Stat color">
                <ColorPicker color={panel.plugins.alert.stat.color} onChange={c => onChange((panel: Panel) => {
                    panel.plugins.alert.stat.color = c
                })} circlePicker />
            </PanelEditItem>
            <PanelEditItem title="Stat layout">
                <RadionButtons options={Object.keys(LayoutOrientation).map(k => ({ label: LayoutOrientation[k], value: LayoutOrientation[k] }))} value={panel.plugins.alert.stat.layout} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.alert.stat.layout = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Stat color mode">
                <RadionButtons options={[{ label: "Value", value: "value" }, { label: "Background", value: "bg-solid" }, { label: "Background gradient", value: "bg-gradient" }]} value={panel.plugins.alert.stat.colorMode} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.alert.stat.colorMode = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Stat graph style">
                <RadionButtons options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }]} value={panel.plugins.alert.stat.style} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.alert.stat.style = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Stat name">
                <EditorInputItem value={panel.plugins.alert.stat.statName} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.alert.stat.statName = v
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
            </PanelEditItem>
        </>}
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
            <PanelEditItem title="Reset toolbar options">
                <Button size="sm" onClick={() => dispatch(ResetPanelToolbalEvent + panel.id)}>Reset toolbar options</Button>
            </PanelEditItem>
        </PanelAccordion>
        <PanelAccordion title="Filter">
            <PanelEditItem title="State">
                <MultiRadionButtons options={Object.keys(AlertState).map(k => ({ label: AlertState[k], value: AlertState[k] }))} value={panel.plugins.alert.filter.state} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.alert.filter.state = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Datasource" desc="Query alerts from these datasources">
                <Select style={{ minWidth: "300px" }} value={panel.plugins.alert.filter.datasources} allowClear mode="multiple" options={
                    datasources.filter(ds => datasourceSupportAlerts.includes(ds.type)).map(ds => ({ label: ds.name, value: ds.id }))} onChange={
                        (v) => {
                            onChange((panel: Panel) => {
                                panel.plugins.alert.filter.datasources = v
                            });
                            dispatch(PanelForceRebuildEvent + panel.id)
                        }
                    } />
            </PanelEditItem>
            {panel.plugins.alert.filter.datasources.find(dsId => datasources.find(ds => ds.id == dsId).type == DatasourceType.ExternalHttp) && <HttpQueryEditor panel={panel} datasource={panel.datasource} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.alert.filter.httpQuery = v
                })} query={panel.plugins.alert.filter.httpQuery}/>}
            <PanelEditItem title="Rule name" desc="Filter for alert rules containing this text">
                <EditorInputItem value={panel.plugins.alert.filter.ruleName} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.alert.filter.ruleName = v
                })} placeholder="support multi regex, separate with comman e.g: ^service1, ^service2" />
            </PanelEditItem>
            <PanelEditItem title="Rule labels" desc={`Filter rule labels using label querying, e.g: {severity="critical"}`}>
                <EditorInputItem value={panel.plugins.alert.filter.ruleLabel} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.alert.filter.ruleLabel = v
                })} placeholder="" />
            </PanelEditItem>
            <PanelEditItem title="Alert label" desc={`Filter alert labels using label querying, e.g: {service="api-gateway", instance=~"cluster-cn-.+"}`}>
                <EditorInputItem value={panel.plugins.alert.filter.alertLabel} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.alert.filter.alertLabel = v
                })} placeholder="" />
            </PanelEditItem>

        </PanelAccordion>
        <PanelAccordion title="Chart">
            <PanelEditItem title="Show">
                <Switch isChecked={panel.plugins.alert.chart.show} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.alert.chart.show = e.target.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Chart height" desc="Css style height">
                <EditorInputItem value={panel.plugins.alert.chart.height} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.alert.chart.height = v
                    dispatch(PanelForceRebuildEvent + panel.id)
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

        <PanelAccordion title={t.interaction}>
            <ClickActionsEditor panel={panel} onChange={v => {
                onChange((panel: Panel) => {
                    panel.plugins.alert.clickActions = v
                })
            }} actions={panel.plugins.alert.clickActions}/>
        </PanelAccordion>
    </>
    )
})

export default AlertPanelEditor