export interface Dashboard {
    id: string 
    title: string
    ownedBy: number 
    data: DashboardData
    editable?: boolean
    createdBy?: string
    created?: string 
    updated?: string 
}

export interface DashboardData {
    description?: string
    panels?: Panel[]
}

export interface Panel {
    id: number 
    title: string
    desc?: string
    type: string
    gridPos: GridPos
    collapsed?: boolean
    transparent?: boolean
}

export interface GridPos {
    x: number;
    y: number;
    w: number;
    h: number;
    static?: boolean;
}