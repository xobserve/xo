import { PanelType } from "types/dashboard"

//@needs-update-when-add-new-panel
export interface PanelPlugins {
    [PanelType.Text]?: TextPlugin

    [PanelType.Graph]?: GraphSettings
    [PanelType.Table]?: TableSettings
    [PanelType.NodeGraph]?: NodeGraphSettings
    [PanelType.Echarts]?: EchartsSettings
    [PanelType.Pie]?: PieSettings
    [PanelType.Gauge]?: GaugeSettings
}

/*-------------------- Plugins ----------------------- */

export interface DisableDatasource {
    disableDatasource?: boolean
}

export interface PieSettings {

}

export interface GaugeSettings {
    value: GaugeValueSettings
}

export interface GaugeValueSettings extends ValueSetting  {
    min: number
    max: number
}

export interface EchartsSettings {
    allowEmptyData: boolean
    setOptionsFunc: string
    registerEventsFunc: string
}

export interface TextPlugin extends DisableDatasource {
    md?: string
    justifyContent: "center" | "left" | "right"
    alignItems: "center" | "top" | "bottom"
    fontSize: string,
    fontWeight: string,
}


export interface TableSettings {
    showHeader: boolean
    globalSearch: boolean
    enablePagination: boolean
    pageSize: number
    enableFilter: boolean
    enableSort: boolean
    onRowClick: string
}

export interface NodeGraphSettings {
    node: {
        baseSize: number
        maxSize: number
        icon: NodeGraphIcon[]
        shape: 'circle' | 'donut',
        donutColors: string // json string 
        tooltipTrigger: 'mouseenter' | 'click'
        menu: NodeGraphMenuItem[]
    }

    edge: {
        shape: string
        arrow: string
        color: {
            light: string
            dark: string
        }
        opacity: number
        highlightColor: {
            light: string
            dark: string
        }
    }

    legend: {
        enable: boolean
    }

    layout: {
        nodeStrength: number,
        gravity: number
    }
}

export interface GraphSettings {
    tooltip?: {
        mode: 'single' | 'all' | 'hidden'
        sort: "asc" | "desc"
    }
    legend?: {
        mode: "table" | "hidden"
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
    std: ValueSetting
}






/*-------------------- Misc ----------------------- */
export interface NodeGraphIcon {
    key: string
    value: string
    icon: string
}

export interface NodeGraphMenuItem {
    id?: number
    name: string
    event: string
}


export interface ValueSetting extends Units {
    decimals: number
}

export type UnitsType = 'none' | 'time' | 'bytes' | 'percent' | 'custom';
export interface Unit {
    operator: "x" | "/",
    rhs: number,
    unit: string
}

export interface Units {
    unitsType: UnitsType,
    units: {
        operator: "x" | "/",
        rhs: number,
        unit: string
    }[],
}
