import { Panel, PanelEditorProps } from "types/dashboard"

export const PanelType = "xobserveLog"

export interface xobserveLogPanel extends Panel {
    plugins: {
        [PanelType]: xobserveLogSettings
    }
}

export interface xobserveLogEditorProps extends PanelEditorProps {
    panel: xobserveLogPanel
}



export interface xobserveLogSettings  {
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
