import { isEmpty } from "lodash"
import { Panel, PanelQuery, PanelType } from "types/dashboard"
import { TimeRange } from "types/time"

export const jaegerToPanels = (rawData: any[], panel: Panel, query: PanelQuery, range: TimeRange) => {
    if (rawData.length == 0) {
        return null
    }

    switch (panel.type) {
        case PanelType.NodeGraph:
            return jaegerToNodeGraphData(rawData, query)

        case PanelType.Graph:
        case PanelType.Stat:
        case PanelType.Gauge:
        case PanelType.Pie:
        case PanelType.Echarts:
            return null
    }
}


const jaegerToNodeGraphData = (rawData: any[], query: PanelQuery) => {
}