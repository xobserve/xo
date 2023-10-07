import { Panel } from "types/dashboard";
import { SeriesData } from "types/seriesData";
import { PluginSettings } from "./types";


export const buildOptions = (panel: Panel, data: SeriesData[], colorMode: "light" | "dark") => {
    const options: PluginSettings = panel.plugins[panel.type]

    const legend = data.map(item => item.name)
    const seriesData = legend.map(i => ({ name: i, value: [] }))
    const indicator = {}
    data.forEach(item => {
        item.fields.forEach(field => {
            const total = field.values.reduce((a, b) => a + b)
            if (indicator[field.name] && indicator[field.name] > total) {
                indicator[field.name] = field.values.reduce((a, b) => a + b)
            } else {
                indicator[field.name] = field.values.reduce((a, b) => a + b)
            }
            const idx = seriesData.findIndex(i => i.name === item.name)
            seriesData[idx].value.push(total)
        })
    })
    const opts = {
        darkMode: colorMode === 'dark',
        legend: {
            data: legend,
            show: options.graph.legend.mode,
            top: options.graph.legend.top,
            bottom: options.graph.legend.bottom,
            left: options.graph.legend.left,
            right: options.graph.legend.right,
            orient: options.graph.legend.orient,
            itemGap: options.graph.legend.itemGap,
        },
        animation: options.animation,
        radar: {
            shape: options.radar.shape,
            indicator: Object.keys(indicator).map(key => ({ name: key, value: indicator[key] * 1.25 })),
        },
        series: [
            {
                type: 'radar',
                data: seriesData,
            }
        ]
    }

    return opts
}