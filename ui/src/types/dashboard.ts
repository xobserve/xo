import { PanelPlugins } from "./panel/plugins"
import { PanelStyles } from "./panel/styles"
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
}

export interface PanelEditorProps {
    panel: Panel
    onChange: any
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
    Stat = "stat"
}

export enum DatasourceType {
    Prometheus = "prometheus",
    Jaeger = "jaeger",
    ExternalHttp = "external-http",
    TestData = "testdata"
}

export interface PanelDatasource {
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
    mockData?: any
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
}

export type PanelData = any

export enum DashboardLayout {
    Vertical = "vertical",
    Random = "null" ,
    Horizontal =  "horizontal"
}


