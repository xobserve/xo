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
import { LayoutOrientation } from "types/layout"
import { BarThresholdArrow } from "types/plugins/bar"
import { ArcGisMapServer, BaseLayerType, DataLayerType } from "types/plugins/geoMap"
import { LogThreshold } from "types/plugins/log"
import { ThresholdsConfig } from "types/threshold"
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
    [PanelType.BarGauge]?: BarGaugeSettings
    [PanelType.GeoMap]?: GeoMapSettings
    [PanelType.Log]?: LogSettings
    [PanelType.Bar]?: BarSettings
    [PanelType.Alert]?: AlerSettings
}

/*-------------------- Plugins ----------------------- */

export interface DisableDatasource {
    disableDatasource?: boolean
}

export interface AlerSettings extends DisableDatasource {
    orderBy: "newest" | "oldest"
    toolbar: {
        show: boolean
        width: number 
    }
    chart: {
        show: boolean
        height: string
        showLabel: "auto" | "always" | "none"
        stack: "auto" | "always" | "none"
        tooltip: "none" | "single" | "all"
    }
    filter: {
        datasources: number[]
    }
}


export interface BarSettings {
    showGrid: boolean
    tooltip: "none" | "single" | "all"
    stack: "auto" | "always" | "none"
    showLabel: "auto" | "always" | "none"
    styles: {
        barWidth: number
        axisFontSize: number 
        labelFontSize: number
        barOpacity: number
    }
    axis: {
        swap: boolean
        scale: "linear" | "log"
        scaleBase: 2 | 10
    }
    value: ValueSetting
    legend: {
        show: boolean
        placement: "bottom" | "right"
        valueCalcs: ValueCalculationType[]
        width: number
        nameWidth: string
        order: {
            by: ValueCalculationType
            sort: "asc" | "desc"
        }
    }
    thresholds: ThresholdsConfig
    thresholdsDisplay: ThresholdDisplay
    thresholdArrow: BarThresholdArrow
}

export interface LogSettings {
    showTime: boolean
    timeColumnWidth: number
    orderBy: "newest" | "oldest"
    timeStampPrecision: "ns" | "us" | "ms" | "s" | "m" | "h"
    labels: {
        display: string[]
        width: number
        layout: LayoutOrientation
    }
    styles: {
        labelColorSyncChart: boolean
        labelColor: string
        labelValueColor: string
        contentColor: string
        fontSize: string
        wordBreak: "break-word" | "break-all"
    }
    toolbar: {
        show: boolean
        width: number 

    }
    chart: {
        show: boolean
        height: string
        showLabel: "auto" | "always" | "none"
        stack: "auto" | "always" | "none"
    }
    thresholds: LogThreshold[]
}

export interface GeoMapSettings {
    sizeScale: {
        enable: boolean
        baseSize: number
        maxScale: number
    }
    initialView: {
        center: [number, number],
        zoom: number
    },
    baseMap: {
        layer: BaseLayerType
        mapServer: ArcGisMapServer
        url: string
        attr: string
    }
    dataLayer: {
        layer: DataLayerType
        opacity: number
    }
    controls: {
        enableZoom: boolean
        showZoom: boolean
        showAttribution: boolean
        showScale: boolean
        showDebug: boolean
        showMeasure: boolean
        showTooltip: boolean
    }
    value: ValueSetting
    thresholds: ThresholdsConfig
}

export interface BarGaugeSettings {
    value: ValueSetting
    orientation: "horizontal" | "vertical"
    mode: "basic" | "lcd"

    style: {
        titleSize: number
        valueSize: number
        showUnfilled: boolean
    }
    min: number
    max: number
    maxminFrom: "series" | "all"
    showMax: boolean
    showMin: boolean
    thresholds: ThresholdsConfig
}
export interface TraceSettings {

}

export interface StatSettings {
    showTooltip: boolean
    showGraph: boolean
    diisplaySeries: string
    showLegend: boolean
    styles: {
        colorMode: "none" | "value" | "bg-gradient" | "bg-solid"
        layout: LayoutOrientation
        style: "lines" | "bars"
        fillOpacity: number
        graphHeight: number
        connectNulls: boolean
        hideGraphHeight: number
        textAlign: "left" | "center"
    }
    textSize: {
        value: number
        legend: number
    }
    axisY: {
        scale: "linear" | "log"
        scaleBase: 2 | 10
    }
    value: ValueSetting
    thresholds: ThresholdsConfig
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
    thresholds: ThresholdsConfig
    enableThresholds: boolean
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
    diisplaySeries: string
    value: GaugeValueSettings
    scale: {
        enable: boolean
        splitNumber: number
        fontSize: number
    }
    axis: {
        width: number
        showTicks: boolean
    }
    title: {
        show: boolean
        display: string
        fontSize: number
        left: string
        top: string
    }
    pointer: {
        length: string
        width: number
    }
    thresholds: ThresholdsConfig
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
    thresholds: ThresholdsConfig
    enableThresholds: boolean
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
    bordered: boolean
    cellSize: "small" | "middle" | "large"
    tableWidth: number
    stickyHeader: boolean
    column: {
        colorTitle: boolean
        align: "auto" | "left" | "center" | "right"
        enableSort: boolean
        enableFilter: boolean
    }

    globalSearch: boolean
    enablePagination: boolean

    onRowClick: string
    rowActions: { name: string; action: string; style: string; color: string }[]
    actionColumnName: string
    actionClumnWidth: string
    actionButtonSize: "xs" | "sm" | "md"
}

export interface NodeGraphSettings {
    node: {
        baseSize: number
        maxSize: number
        icon: NodeGraphIcon[]
        shape: 'circle' | 'donut',
        donutColors: { attr: string; color: string }[]
        tooltipTrigger: 'mouseenter' | 'click'
        menu: NodeGraphMenuItem[]
        enableHighlight: boolean
        highlightNodes: string
        highlightNodesByFunc: string
        highlightColor: string
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
        barRadius: number
        barGap: 10
        enableStack: boolean
    }
    axis?: {
        label?: string
        showGrid?: boolean
        scale?: "linear" | "log"
        scaleBase?: 2 | 10
    },
    value: ValueSetting
    thresholds: ThresholdsConfig
    thresholdsDisplay: ThresholdDisplay
}


export enum ThresholdDisplay {
    None = "None",
    Line = "Line",
    DashedLine = "Dashed Line",
    Area = "Area",
    AreaLine = "Area Line",
    AreaDashedLine = "Area Dashed Line"
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
    units: Unit[],
}
