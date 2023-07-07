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
    Trace = "trace"
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
    Random = "null" ,
    Horizontal =  "horizontal"
}


