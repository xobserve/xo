export const DatasourceTypeVM = "clickhouse"

export interface ChPluginData  {
    columns: string[] 
    data: any[][]
    types: Record<string,string>
}