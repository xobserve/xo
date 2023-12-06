// Copyright 2023 xObserve.io Team

import { Panel, PanelQuery } from 'types/dashboard'

import { TimeRange } from 'types/time'
import { isEmpty } from 'utils/validate'
import { PanelTypeGraph } from '../../../built-in/panel/graph/types'
import { PanelTypeBar } from '../../../built-in/panel/bar/types'
import { PanelTypeStat } from '../../../built-in/panel/stat/types'
import { DataFormat } from 'types/format'
import {
  queryPluginDataToTable,
  queryPluginDataToTimeSeries,
} from 'utils/plugins'
import { QueryPluginData } from 'types/plugin'

export const clickhouseToPanelData = (
  data: QueryPluginData,
  panel: Panel,
  query: PanelQuery,
  range: TimeRange,
) => {
  if (isEmpty(data) || data.columns.length == 0 || data.data.length == 0) {
    return null
  }

  let expandTimeRange
  const et = query.data['expandTimeline']

  if (isEmpty(et) || et == 'auto') {
    expandTimeRange =
      panel.type == PanelTypeGraph ||
      panel.type == PanelTypeBar ||
      panel.type == PanelTypeStat
  } else {
    expandTimeRange = et == 'always'
  }

  switch (query.data['format']) {
    case DataFormat.TimeSeries:
      return queryPluginDataToTimeSeries(data, query)
    case DataFormat.Table:
      return queryPluginDataToTable(data, query)
    default:
      return queryPluginDataToTimeSeries(data, query)
  }
}
