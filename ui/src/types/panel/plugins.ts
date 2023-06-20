import { PanelType } from "types/dashboard"

//@needs-update-when-add-new-panel
export interface PanelPlugins {
    [PanelType.Text]?: TextPlugin

    [PanelType.Graph]?: GraphSettings
    [PanelType.Table]?: TableSettings
    [PanelType.NodeGraph]?: NodeGraphSettings
    [PanelType.Echarts]?: EchartsSettings
}

/*-------------------- Plugins ----------------------- */

export interface CommonPluginSettings {
    disableDatasource?: boolean
}

export interface EchartsSettings extends CommonPluginSettings {
    allowEmptyData: boolean
    setOptionsFunc: string
    registerEventsFunc: string
}

export interface TextPlugin extends CommonPluginSettings {
    md?: string
    justifyContent: "center" | "left" | "right"
    alignItems: "center" | "top" | "bottom"
    fontSize:  string,
    fontWeight: string,
}


export interface TableSettings extends CommonPluginSettings {
    showHeader: boolean
    globalSearch: boolean
    enablePagination: boolean
    pageSize: number
    enableFilter: boolean
    enableSort: boolean
    onRowClick: string
}

export interface NodeGraphSettings extends CommonPluginSettings {
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

export interface GraphSettings extends CommonPluginSettings {
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




export type UnitsType = 'none' | 'time' | 'bytes' | 'percent' | 'custom';
export interface Unit {
    operator: "x" | "/",
    rhs: number,
    unit: string
}