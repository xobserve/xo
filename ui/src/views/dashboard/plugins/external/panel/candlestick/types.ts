export interface PluginSettings  {
    animation: boolean
    maLine: {
        ma5: boolean
        ma10: boolean
        ma20: boolean
        ma30: boolean
    }
    mark: {
        minPoint: "none" | "lowest" | "open"
        maxPoint: "none" | "highest" | "close"
        minLine: "none" | "lowest" | "open"
        maxLine: "none" | "highest" | "close"
    }
}


export const initSettings: PluginSettings = {
    animation: false,
    maLine: {
        ma5: true,
        ma10: true,
        ma20: true,
        ma30: true,
    },
    mark: {
        minPoint:  "lowest",
        maxPoint: "highest",
        minLine: "lowest",
        maxLine:  "highest",
    }
}