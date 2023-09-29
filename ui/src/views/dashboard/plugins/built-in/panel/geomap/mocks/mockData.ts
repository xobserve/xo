import geoData from './geomapSeriesData.json'

import { Panel, PanelDatasource, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"

export const mockGeomapDataForTestDataDs = (panel: Panel, timeRange: TimeRange,ds: PanelDatasource,q: PanelQuery) => {
    return geoData
}