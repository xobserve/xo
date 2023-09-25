import { getInitUnits } from "src/data/panel/initPlugins"
import { Unit, UnitsType, ValueSetting } from "types/panel/plugins"

export interface PluginSettings  {
    animation: boolean
    chartOpacity: number
    kChart: {
        displayName: string
        fixTooltip: boolean
        upColor: string 
        downColor: string
        splitLine: boolean
        splitArea: boolean
        solidBar: boolean
    }
    volumeChart: {
        show: boolean
        syncColor: boolean
        value: ValueSetting
        splitLine: boolean 
        showYAxisLabel: boolean
    } 
    maLine: {
        lineSymbol: "none" |"circle" | "emptyCircle" 
        lineWidth: number
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

export const upColor = "#00da3c"
export const downColor = "#ec0000"

export const initSettings: PluginSettings = {
    animation: false,
    chartOpacity: 0.8,
    kChart: {
        displayName: "",
        fixTooltip: true,
        upColor: upColor,
        downColor: downColor,
        splitLine: false, 
        splitArea: true,
        solidBar: true
    },
    volumeChart: {
        show: false,
        syncColor: true,
        value: {
            ...getInitUnits(),
            decimal: 2,
        },
        splitLine: false,
        showYAxisLabel: false
    },
    maLine: {
        lineSymbol: "none",
        lineWidth: 2,
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