
export interface Variable {
    id?: number
    name: string 
    type: string
    datasource?: number
    value?: string
    description?: string
    created?: string
    values?: string[]
    selected?: string
    regex?: string 
    refresh?: VariableRefresh
    enableMulti?: boolean
    enableAll?: boolean
}

export enum VariableQueryType {
    Custom = "custom",
    Datasource = "Datasoure"
}

export enum VariableRefresh {
    OnDashboardLoad = "On dashboard load",
    OnTimeRangeChange = "On timerange change"
}