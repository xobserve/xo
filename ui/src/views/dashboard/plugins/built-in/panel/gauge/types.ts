import { Panel, PanelEditorProps } from "types/dashboard"
import {  ValueSetting } from "types/panel/plugins"
import { ThresholdsConfig } from "types/threshold"

export const PanelTypeGauge = "gauge"


export interface GaugePanel extends Panel {
    plugins: {
        [PanelTypeGauge]: GaugeSettings
    }
}

export interface GaugeEditorProps extends PanelEditorProps {
    panel: GaugePanel
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

export interface GaugeValueStyles {
    show: boolean
    min: number
    max: number
    fontSize: number
    left: string
    top: string
}