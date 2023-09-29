import { ClickAction } from "src/views/dashboard/edit-panel/components/ClickActionsEditor"
import { Panel, PanelEditorProps } from "types/dashboard"
import { AlertFilter, ThresholdDisplay, ValueSetting } from "types/panel/plugins"
import { ThresholdsConfig } from "types/threshold"
import { ValueCalculationType } from "types/value"

export const PanelTypeGraph = "graph"


export interface GraphPanel extends Panel {
    plugins: {
        [PanelTypeGraph]: GraphSettings
    }
}

export interface GraphEditorProps extends PanelEditorProps {
    panel: GraphPanel
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