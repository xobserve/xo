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



export interface DatavLogSettings  {
    showChart: boolean 
    showLogs: boolean
    showSearch: boolean
    headerFontSize: number
    logFontSize: number
    logline: {
        wrapLine: boolean
        allowOverflow: boolean
    }
    columns: {
        displayColumns: {key:string;name?: string;width: number | number[]}[]
        highlight: Record<string,string>[]
    }
}
