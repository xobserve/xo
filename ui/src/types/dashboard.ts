import { DataFrame } from "./dataFrame"
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
    description?: string
    panels?: Panel[]
    variables?: Variable[]
    sharedTooltip?: boolean
    editable?: boolean
    hidingVars?: string
    tags?: string[]
}

export interface Panel {
    id: number 
    title: string
    desc?: string
    type: PanelType

    gridPos: GridPos
    collapsed?: boolean
    transparent?: boolean
    showBorder?: boolean
    // for plugin settings
    settings?: PanelSettings

    // for querying data
    useDatasource?: boolean
    datasource?: PanelDatasource[]
}

export interface PanelSettings {
    text?: {
        md?: string
    }
    graph?: GraphSettings
    table?: TableSettings
}

export interface GraphSettings {
    tooltip?: {
        mode: "single" | "all" | "hidden"
        sort: "asc" | "desc"
    }
    legend?: {
        mode:  "table" | "hidden"
        placement: "bottom" | "right"
    }
    styles?: {
        style: "lines" | "bars" | "points"
        lineWidth: number
        fillOpacity: number
        showPoints: "auto" | "always" | "never"
        pointSize: number
        gradientMode: "none" | "opacity" | "hue"
    }
    axis?: {
        label?: string
        showGrid?: boolean
        scale?: "linear" | "log"
        scaleBase?: 2 | 10
    },
    std: {
        unitsType: UnitsType,
        units: {
            operator: "x" | "/",
            rhs: number,
            unit: string
        }[],
        decimals: number
    }
}

export type UnitsType = 'none' | 'time' | 'bytes' | 'percent' | 'custom';
export interface Unit {
    operator: "x" | "/",
    rhs: number,
    unit: string
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
    sync?: any
}

export interface TableSettings {
    showHeader?: boolean
    globalSearch?: boolean
    enablePagination?: boolean
    pageSize?: number
    enableFilter?: boolean
    enableSort?: boolean
    onRowClick?: string
}