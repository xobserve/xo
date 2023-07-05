import { DatasourceType, Panel, PanelDatasource, PanelQuery } from "./dashboard"
import { Variable } from "./variable"

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
    panel?: Panel
    datasource: PanelDatasource
    query: PanelQuery
    onChange: any
}

export interface DatasourceVariableEditorProps {
    variable: Variable
    onChange: any
    onQueryResult: any
}