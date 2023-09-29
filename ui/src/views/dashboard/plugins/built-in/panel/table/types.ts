import { ClickAction } from "src/views/dashboard/edit-panel/components/ClickActionsEditor"
import { Panel, PanelEditorProps } from "types/dashboard"
import type { ColumnType } from 'antd/es/table';

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

export interface TableSeries {
    name: string // series name,
    rawName: Object
    columns: TableColumn[]// table columns
    rows: TableRow[] // table data, each item in data list is a table row: key is the column name, value is the corresponding row value
}

export interface TableColumn extends ColumnType<TableRow> {
    dataIndex: string
}

export interface TableRow {
    __bg__?: any
    __value__?: any
    [columnName:string]: number | string
}

// Every datasource plugin must return a TablePluginData to Table panel
export type TablePluginData = TableSeries[]