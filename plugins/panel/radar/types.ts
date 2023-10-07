export const PanelTypeRadar = "radar"

export interface PluginSettings {
    animation: boolean
    graph: {
        legend: {
            mode: boolean
            left?: number
            right?: number
            top?: number
            bottom?: number
            orient?: string
            itemGap?: number
        }
    }
    radar: {
        shape?: string
    }
}


export const initSettings: PluginSettings = {
    animation: false,
    radar: {
        shape: 'polygon'
    },
    graph: {
        legend: {
            mode: true,
            right: 0,
            top: 0,
            orient: 'vertical',
            itemGap: 20
        }
    }
}