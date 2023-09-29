import { genPrometheusMockData, prometheusToPanels } from "src/views/dashboard/utils/prometheus"
import { Panel, PanelDatasource, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"

export const mockBarDataForTestDataDs = (panel: Panel, timeRange: TimeRange,ds: PanelDatasource,q: PanelQuery) => {
    const data = prometheusToPanels(genPrometheusMockData(timeRange,ds,q), panel, q, timeRange)
    return data
}