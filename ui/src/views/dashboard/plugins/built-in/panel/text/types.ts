import { Panel, PanelEditorProps } from "types/dashboard"
import { DisableDatasource } from "types/panel/plugins"

export const PanelType = "text"

export interface TextPanel extends Panel {
    plugins: {
        [PanelType]: TextSettings
    }
}

export interface TextEditorProps extends PanelEditorProps {
    panel: TextPanel
}



export interface TextSettings extends DisableDatasource {
    md?: string
    justifyContent: "center" | "left" | "right"
    alignItems: "center" | "top" | "bottom"
    fontSize: string,
    fontWeight: string,
}