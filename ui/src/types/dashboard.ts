export interface Dashboard {
    id: string 
    title: string
    ownedBy: number 
    data: DashboardData

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
    type: string
    gridPos: GridPos
}

export interface GridPos {
    x: number;
    y: number;
    w: number;
    h: number;
    static?: boolean;
}