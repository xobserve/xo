import { Panel, PanelEditorProps } from "types/dashboard"
import { DisableDatasource } from "types/panel/plugins"

export const PanelType = "datavLog"

export interface DatavLogPanel extends Panel {
    plugins: {
        [PanelType]: DatavLogSettings
    }
}

export interface DatavLogEditorProps extends PanelEditorProps {
    panel: DatavLogPanel
}



interface DatavLogSettings  {
    md?: string
    justifyContent: "center" | "left" | "right"
    alignItems: "center" | "top" | "bottom"
}
