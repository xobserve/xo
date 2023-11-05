import { Panel, PanelEditorProps } from "types/dashboard"

export const PanelType = "observexLog"

export interface observexLogPanel extends Panel {
    plugins: {
        [PanelType]: observexLogSettings
    }
}

export interface observexLogEditorProps extends PanelEditorProps {
    panel: observexLogPanel
}



export interface observexLogSettings  {
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
