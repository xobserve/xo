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
import { PanelPlugins } from "./panel/plugins"
import { PanelStyles } from "./panel/styles"
import { TimeRange } from "./time"
import { Variable } from "./variable"

export interface Dashboard {
    id: string
    title: string
    ownedBy: number
    data: DashboardData
    editable?: boolean
    createdBy?: string
    created?: string
    updated?: string
    updateChanges?: string
}

export interface DashboardData {
    description: string
    panels: Panel[]
    variables: Variable[]
    sharedTooltip: boolean
    editable: boolean
    hidingVars: string
    tags: string[]
    styles: {
        bg: string
        bgEnabled: boolean
        border: string
        // decoration: DecorationStyles
    }
    layout: DashboardLayout
    allowPanelsOverlap: boolean
    enableUnsavePrompt: boolean
    enableAutoSave: boolean
    autoSaveInterval: number
}

export interface Panel {
    id?: number
    title?: string
    desc: string
    type: PanelType

    gridPos: GridPos
    collapsed: boolean

    // for plugin settings
    plugins: PanelPlugins

    styles: PanelStyles

    datasource: PanelDatasource

    overrides: OverrideItem[]

    transform: string
    enableTransform: boolean
}

export interface OverrideItem {
    target: string 
    overrides: OverrideRule[]
}

export interface OverrideRule {
    type: string 
    value: any
}


export interface PanelEditorProps {
    panel: Panel
    onChange: any
    data?: any
}




export enum PanelType {
    Table = "table",
    Graph = "graph",
    Text = "text",
    Row = "row",
    NodeGraph = "nodeGraph",
    Echarts = "echarts",
    Pie = "pie",
    Gauge = "gauge",
    Stat = "stat",
    Trace = "trace",
    BarGauge = "barGauge"
}

export enum DatasourceType {
    Prometheus = "prometheus",
    Jaeger = "jaeger",
    ExternalHttp = "external-http",
    TestData = "testdata"
}

export interface PanelDatasource {
    id?: number
    type: DatasourceType
    queryOptions: {
        maxDataPoints?: number
        minInterval: string
    }
    queries?: PanelQuery[]
}

export interface PanelQuery {
    id: number
    metrics: string
    legend: string
    visible: boolean
    interval?: number
    data?: {[key:string]:any}
}

export interface GridPos {
    x: number;
    y: number;
    w: number;
    h: number;
    static?: boolean;
}


export interface PanelProps {
    panel: Panel
    dashboardId?: string
    width?: number
    height?: number
    sync?: any
    data?: any
    timeRange?: TimeRange
}

export type PanelData = any

export enum DashboardLayout {
    Vertical = "vertical",
    Custom = "null" ,
    Horizontal =  "horizontal"
}


