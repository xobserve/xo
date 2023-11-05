import mockLogs from "./logs.json"
import mockChart from './chart.json'

import { Panel, PanelDatasource, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"

export const mockLogDataForTestDataDs = (panel: Panel, timeRange: TimeRange,ds: PanelDatasource,q: PanelQuery) => {
    return {
        logs: mockLogs,
        chart: mockChart
    }
}
