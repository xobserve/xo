import {PanelEditorProps, Panel} from 'types/dashboard'
import { ThresholdDisplay, ValueSetting } from 'types/panel/plugins'
import { BarThresholdArrow } from 'types/plugins/bar'
import { ThresholdsConfig } from 'types/threshold'
import { ValueCalculationType } from 'types/value'

export const PanelTypeBar = "bar"

export interface BarPanel extends Panel {
    plugins: {
        [PanelTypeBar]: BarSettings
    }
}

export interface BarEditorProps extends PanelEditorProps {
    panel: BarPanel
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