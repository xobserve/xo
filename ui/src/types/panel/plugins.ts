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
import { PanelType } from "types/dashboard"
import { ValueCalculationType } from "types/value"

//@needs-update-when-add-new-panel
export interface PanelPlugins {
    [PanelType.Text]?: TextPlugin

    [PanelType.Graph]?: GraphSettings
    [PanelType.Table]?: TableSettings
    [PanelType.NodeGraph]?: NodeGraphSettings
    [PanelType.Echarts]?: EchartsSettings
    [PanelType.Pie]?: PieSettings
    [PanelType.Gauge]?: GaugeSettings
    [PanelType.Stat]?: StatSettings
    [PanelType.Trace]?: TraceSettings
}

/*-------------------- Plugins ----------------------- */

export interface DisableDatasource {
    disableDatasource?: boolean
}


export interface TraceSettings {
    
}

export interface StatSettings  {
    showTooltip: boolean
    showLegend: boolean
    styles: {
        style: "lines" | "bars" 
        fillOpacity: number
        gradientMode: "none" | "opacity"
        color: string
        graphHeight: number
        connectNulls: boolean
    }
    axisY: {
        scale: "linear" | "log"
        scaleBase: 2 | 10
    }
    value: ValueSetting
}

export interface PieSettings {
    animation: boolean
    showLabel: boolean
    onClickEvent: string
    shape: {
        type: 'normal' | 'rose'
        borderRadius: number
        radius: number
        innerRadius: number
    }
    legend: {
        show: boolean
        orient: 'vertical' | 'horizontal'
        placement: PieLegendPlacement
    }
    value: ValueSetting
}

export enum PieLegendPlacement {
    Top = "top",
    Bottom = 'bottom',
    TopLeft = 'top-left',
    TopRight = 'top-right',
    BottomLeft = 'bottom-left',
    BottomRight = 'bottom-right'
}

export interface GaugeSettings {
    animation: boolean
    value: GaugeValueSettings
    scale: {
        enable: boolean
        splitNumber: number
        fontSize: number
    }
    axis: {
        width: number
        showTicks: boolean
        split: GaugeAxisSplit[]
    }
    title: {
        show: boolean
        fontSize: number
        left: string
        top: string
    }
}

export type GaugeAxisSplit = [number, string]

export interface GaugeValueSettings {
    show: boolean
    min: number
    max: number
    fontSize: number
    left: string
    top: string
    decimal: number
    unit: string
    calc: ValueCalculationType
}

export interface EchartsSettings {
    animation: boolean
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
        display: boolean
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
        valueCalcs: ValueCalculationType[]
        width: number
        nameWidth: string
        order: {
            by: ValueCalculationType
            sort: "asc" | "desc"
        }
    }
    styles?: {
        style: "lines" | "bars" | "points"
        lineWidth: number
        fillOpacity: number
        showPoints: "auto" | "always" | "never"
        pointSize: number
        gradientMode: "none" | "opacity" | "hue"
        connectNulls: boolean
    }
    axis?: {
        label?: string
        showGrid?: boolean
        scale?: "linear" | "log"
        scaleBase?: 2 | 10
    },
    value: ValueSetting
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
    decimal: number
    calc?: ValueCalculationType
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
