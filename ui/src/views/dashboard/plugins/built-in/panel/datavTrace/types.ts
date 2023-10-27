import { Panel, PanelEditorProps } from "types/dashboard"
import { DisableDatasource } from "types/panel/plugins"

export const PanelType = "datavTrace"

export interface DatavTracePanel extends Panel {
    plugins: {
        [PanelType]: DatavTraceSettings
    }
}

export interface DatavTraceEditorProps extends PanelEditorProps {
    panel: DatavTracePanel
}



export interface DatavTraceSettings extends DisableDatasource {
}