import { DataFrame } from "./dataFrame"

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
    description?: string
    panels?: Panel[]
}

export interface Panel {
    id: number 
    title: string
    desc?: string
    type: PanelType

    gridPos: GridPos
    collapsed?: boolean
    transparent?: boolean

    // for plugin settings
    pluginSettings?: any
    settings?: PanelSettings 

    // for querying data
    useDatasource?: boolean
    datasource?: PanelDatasource[]
}

export interface PanelSettings {
    activeSeries?: string
}

export enum PanelType {
    Table = "table",
    Graph = "graph",
    Text = "text",
    Row = "row",
}

export enum DatasourceType {
    Prometheus = "prometheus",
    Jaeger = "jaeger",
    ExternalHttp = "external-http",
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
    data?: DataFrame[]
    width?: number 
    height?: number
    onChange?: any
}