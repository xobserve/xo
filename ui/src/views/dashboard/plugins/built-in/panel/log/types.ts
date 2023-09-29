import { ClickAction } from "src/views/dashboard/edit-panel/components/ClickActionsEditor"
import { Panel, PanelEditorProps } from "types/dashboard"
import { LayoutOrientation } from "types/layout"

export const PanelTypeLog = "log"

export interface LogPanel extends Panel {
    plugins: {
        [PanelTypeLog]: LogSettings
    }
}

export interface LogEditorProps extends PanelEditorProps {
    panel: LogPanel
}


export interface LogSettings {
    showTime: boolean
    timeColumnWidth: number
    orderBy: "newest" | "oldest"
    timeStampPrecision: "ns" | "us" | "ms" | "s" | "m" | "h"
    enableDetails: boolean
    enableTransform: boolean
    transform: string
    labels: {
        display: string
        width: number
        widthMap: string
        layout: LayoutOrientation
        maxValueLines: number
    }
    styles: {
        labelColorSyncChart: boolean
        labelColor: string
        labelValueColor: Record<string,string>[]
        contentColor: string
        fontSize: string
        wrapLine: boolean
        wordBreak: "break-word" | "break-all"
        showlineBorder: boolean
        highlight: string
        highlightColor: string
    }
    toolbar: {
        show: boolean
        defaultOpen: boolean
        width: number

    }
    chart: {
        show: boolean
        height: string
        showLabel: "auto" | "always" | "none"
        stack: "auto" | "always" | "none"
        tooltip: "none" | "single" | "all"
        categorize: string
    }
    search: {
        log: string
        labels: string
    }
    interaction: {
        enable: boolean
        actions: ClickAction[]
    }
    thresholds: LogThreshold[]
}


export interface LogSeries  {
    labels: {[key: string]: string};
    values: [number,string][]
}



export interface LogThreshold {
    type: "label" | "content"
    key: string
    value: string 
    color: string
}


export interface Log {
    labels: {[key: string]: string}
    timestamp: number  // nanoseconds
    content?: string 
    highlight?: string[]
    labelHighlight?: string[]
}

export interface LogLabel {
    id: string
    name: string
    value: string
    count?: number
}


export interface LogChartView {
    maxBars: number
    barType: "total" | "labels"
}