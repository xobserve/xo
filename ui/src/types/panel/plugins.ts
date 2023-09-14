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
import { ClickAction } from "src/views/dashboard/edit-panel/components/ClickActionsEditor"
import { AlertState } from "types/alert"
import { PanelQuery, PanelType } from "types/dashboard"
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
    viewMode: "list" | "stat"
    stat: {
        showGraph: boolean
        color: string 
        layout: LayoutOrientation
        colorMode: "none" | "value" | "bg-gradient" | "bg-solid"
        style: "lines" | "bars"
        statName: string
        valueSize: number 
        legendSize: number
    }
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
    filter:AlertFilter
    clickActions: ClickAction[]
}


export interface AlertFilter {
    enableFilter: boolean
    state: AlertState[]
    datasources: number[]
    httpQuery: PanelQuery
    ruleName: string 
    ruleLabel: string
    alertLabel: string
}

export interface BarSettings {
    animation: boolean
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
    enableClick: boolean
    onClickEvent: string
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
        showlineBorder: boolean
        highlight: string
        highlightColor: string
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
        tooltip: "none" | "single" | "all"
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
    enableClick: boolean
    onClickEvent: string
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
    enableClick: boolean
    clickAction: string
    thresholds: ThresholdsConfig
}
export interface TraceSettings {
    defaultService: string 
    enableEditService: boolean
}

export interface StatSettings {
    showTooltip: boolean
    showGraph: boolean
    displaySeries: string
    showLegend: boolean
    styles: {
        colorMode: "none" | "value" | "bg-gradient" | "bg-solid"
        layout: LayoutOrientation
        style: "lines" | "bars"
        fillOpacity: number
        graphHeight: number
        connectNulls: boolean
        showPoints: boolean
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
    enableClick: boolean
    clickAction: string
    thresholds: ThresholdsConfig
}

export interface PieSettings {
    animation: boolean
    label: {
        show: boolean
        showValue: boolean
        showName: boolean
        align: "none" | "labelLine" | "edge"
        margin: number
        fontSize: number
        transformName: string
        lineHeight: number
    }
    enableClick: boolean
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
        fontSize: number
        width: number
        height: number
        gap: number
    }
    top: string 
    left: string
    value: ValueSetting
    thresholds: ThresholdsConfig
    enableThresholds: boolean
    showThreshodBorder: boolean
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
    value: ValueSetting
    valueStyle: GaugeValueStyles
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

export interface GaugeValueStyles {
    show: boolean
    min: number
    max: number
    fontSize: number
    left: string
    top: string
}

export interface EchartsSettings {
    animation: boolean
    allowEmptyData: boolean
    setOptionsFunc: string
    enableClick: boolean
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
        colorTitle: string
        align: "auto" | "left" | "center" | "right"
        enableSort: boolean
        enableFilter: boolean
    }

    globalSearch: boolean
    enablePagination: boolean

    enableRowClick: boolean
    onRowClick: string
    rowActions: ClickAction[]
    actionColumnName: string
    actionClumnWidth: string
    actionButtonSize: "xs" | "sm" | "md"
}

export interface NodeGraphSettings {
    zoomCanvas: boolean
    scrollCanvas: boolean
    dragNode: boolean
    dragCanvas: boolean

    node: {
        baseSize: number
        maxSize: number
        icon: NodeGraphIcon[]
        shape: 'circle' | 'donut' | 'custom',
        donutColors: { attr: string; color: string }[]
        borderColor: string
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
        showValuesName: boolean
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
        padding: number[]
    }
    axis?: {
        label?: string
        showGrid?: boolean
        showX?: boolean
        showY?: boolean
        scale?: "linear" | "log"
        scaleBase?: 2 | 10
    },
    value: ValueSetting
    thresholds: ThresholdsConfig
    thresholdsDisplay: ThresholdDisplay
    enableAlert: boolean
    alertFilter: AlertFilter
    clickActions: ClickAction[]
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
    type: "label" | "data"
}

export interface NodeGraphMenuItem {
    id?: number
    name: string
    event: string
    enable: boolean
}


export interface ValueSetting extends Units {
    decimal: number
    calc?: ValueCalculationType
}

export type UnitsType = 'none' | 'time' | 'bytes' | 'percent' |'short' | 'format' | "enum" | 'custom';
export interface Unit {
    operator: "x" | "/" | "=",
    rhs: number,
    unit: string
}

export interface Units {
    unitsType: UnitsType,
    units: Unit[],
}
