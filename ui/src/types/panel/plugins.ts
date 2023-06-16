export interface TableSettings {
    showHeader: boolean
    globalSearch: boolean
    enablePagination: boolean
    pageSize: number
    enableFilter: boolean
    enableSort: boolean
    onRowClick: string
}

export interface NodeGraphSettings {
    node: {
        baseSize: number
        maxSize: number
        icon: NodeGraphIcon[]
        shape: 'circle' | 'donut',
        donutColors: string // json string 
        tooltipTrigger: 'mouseenter' | 'click'
        menu: NodeGraphMenuItem[]
    }

    edge: {
        shape: string
        arrow: string
        color: {
            light: string
            dark: string
        }
        opacity: number
        highlightColor: {
            light: string
            dark: string
        }
    }

    legend: {
        enable: boolean
    }

    layout: {
        nodeStrength: number,
        gravity: number
    }
}


export interface NodeGraphIcon {
    key: string
    value: string
    icon: string
}

export interface NodeGraphMenuItem {
    id?: number
    name: string
    event: string
}