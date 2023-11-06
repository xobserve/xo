import { ClickAction } from "src/views/dashboard/edit-panel/components/ClickActionsEditor"
import { Panel, PanelEditorProps } from "types/dashboard"

export const PanelType = "xobserveTrace"

export interface TracePanel extends Panel {
    plugins: {
        [PanelType]: TraceSettings
    }
}

export interface TraceEditorProps extends PanelEditorProps {
    panel: TracePanel
}

export interface TraceSettings {
    defaultService: string
    enableEditService: boolean
    interaction: {
        enable: boolean
        actions: ClickAction[]
    },
    chart: {
        height: number 
        type: "line" | "bar"
        stack: boolean
        top: number 
        right: number 
        bottom: number
        left: number
    }
}
