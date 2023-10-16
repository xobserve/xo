export const DatasourceTypeVM = "mysql"

export interface ChPluginData  {
    columns: string[] 
    data: any[][]
    types: Record<string,string>
}