import { Panel, PanelEditorProps } from "types/dashboard"
import { ValueSetting } from "types/panel/plugins"
import { ThresholdsConfig } from "types/threshold"

export const PanelTypeBarGauge = "barGauge"


export interface BarGaugePanel extends Panel {
    plugins: {
        [PanelTypeBarGauge]: BarGaugeSettings
    }
}

export interface BarGaugeEditorProps extends PanelEditorProps {
    panel: BarGaugePanel
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