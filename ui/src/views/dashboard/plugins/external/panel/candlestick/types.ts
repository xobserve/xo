import { getInitUnits } from "src/data/panel/initPlugins"
import { ValueSetting } from "types/panel/plugins"

export interface PluginSettings  {
    animation: boolean
    chartOpacity: number 
    maLine: {
        ma5: boolean
        ma10: boolean
        ma20: boolean
        ma30: boolean
    }
    value: ValueSetting
    mark: {
        minPoint: "none" | "lowest" | "open"
        maxPoint: "none" | "highest" | "close"
        minLine: "none" | "lowest" | "open"
        maxLine: "none" | "highest" | "close"
    }
}


export const initSettings: PluginSettings = {
    animation: false,
    chartOpacity: 0.8,
    maLine: {
        ma5: true,
        ma10: true,
        ma20: true,
        ma30: true,
    },
    value: {
        ...getInitUnits(),
        decimal: 2,
    },
    mark: {
        minPoint:  "lowest",
        maxPoint: "highest",
        minLine: "lowest",
        maxLine:  "highest",
    }
}