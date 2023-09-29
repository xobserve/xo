import { ClickAction } from "src/views/dashboard/edit-panel/components/ClickActionsEditor"
import { Panel, PanelEditorProps } from "types/dashboard"
import { LayoutOrientation } from "types/layout"
import { AlertFilter, DisableDatasource } from "types/panel/plugins"

export const PanelTypeAlert = "alert"

export interface AlertPanel extends Panel {
    plugins: {
        [PanelTypeAlert]: AlerSettings
    }
}

export interface AlertEditorProps extends PanelEditorProps {
    panel: AlertPanel
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
    filter: AlertFilter
    clickActions: ClickAction[]
}