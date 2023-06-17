// A query result may contains multiple series and each series corrosponds to a table
// e.g a query to prometheus usually returns a matrix result, which contains multiple series
export interface TableSeries {
    name: string // series name,
    columns: TableColumn[] // table columns
    rows: TableRow[] // table data, each item in data list is a table row: key is the column name, value is the corresponding row value
}

export interface TableRow {
    [columnName:string]: number | string
}

// Every datasource plugin must return a TablePluginData to Table panel
export type TablePluginData = TableSeries[]


export interface TableColumn {
    Header: string // column name
    canFilter: boolean // whether enable filtering 
    filterType?: "number_between" | "string_match" 
}