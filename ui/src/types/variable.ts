
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
}

export enum VariableQueryType {
    Custom = "custom",
    Datasource = "Datasoure"
}