import { ClickAction } from "src/views/dashboard/edit-panel/components/ClickActionsEditor"
import { Panel, PanelEditorProps } from "types/dashboard"

export const PanelTypeTable = "table"

export interface TablePanel extends Panel {
    plugins: {
        [PanelTypeTable]: TableSettings
    }
}

export interface TableEditorProps extends PanelEditorProps {
    panel: TablePanel
}


export interface TableSettings {
    showHeader: boolean
    bordered: boolean
    cellSize: "small" | "middle" | "large"
    tableWidth: number
    stickyHeader: boolean
    column: {
        colorTitle: string
        align: "auto" | "left" | "center" | "right"
        enableSort: boolean
        enableFilter: boolean
    }

    globalSearch: boolean
    enablePagination: boolean

    enableRowClick: boolean
    onRowClick: string
    rowActions: ClickAction[]
    actionColumnName: string
    actionClumnWidth: string
    actionButtonSize: "xs" | "sm" | "md"
}
