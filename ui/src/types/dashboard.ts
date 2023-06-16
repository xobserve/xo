import { DataFrame, NodeGraphData } from "./dataFrame"
import { GraphSettings, NodeGraphSettings, TableSettings } from "./panel/plugins"
import { DecorationStyles, PanelStyles } from "./panel/styles"
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
        decoration: DecorationStyles
    }
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
    // for querying data
    useDatasource: boolean
    datasource: PanelDatasource[]
}

export interface PanelEditorProps {
    panel: Panel
    onChange: any
}

export interface PanelPlugins {
    text?: {
        md?: string
        justifyContent: "center" | "left" | "right"
        alignItems: "center" | "top" | "bottom"
        fontSize:  string,
        fontWeight: string,
    }

    graph?: GraphSettings
    table?: TableSettings
    nodeGraph?: NodeGraphSettings
}


export enum PanelType {
    Table = "table",
    Graph = "graph",
    Text = "text",
    Row = "row",
    NodeGraph = "nodeGraph",
}

export enum DatasourceType {
    Prometheus = "prometheus",
    Jaeger = "jaeger",
    ExternalHttp = "external-http",
    TestData = "testdata"
}

export interface PanelDatasource {
    type: DatasourceType
    selected: boolean
    queryOptions: {
        maxDataPoints?: number
        interval: string
    }
    queries?: PanelQuery[]
}

export interface PanelQuery {
    id: number
    metrics: string
    legend: string
    visible: boolean
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
    data?: PanelData[]
    dashboardId?: string
    width?: number
    height?: number
    sync?: any
}

export type PanelData = DataFrame & NodeGraphData
