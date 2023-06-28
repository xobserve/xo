import { DatasourceType, PanelDatasource, PanelQuery } from "./dashboard"

export interface Datasource {
    id: number 
    name: string
    type: DatasourceType
    url: string
    data?: {[key: string]: any}
    created?: string 
    updated?: string
}

export interface DatasourceEditorProps {
    datasource: PanelDatasource
    query: PanelQuery
    onChange: any
}