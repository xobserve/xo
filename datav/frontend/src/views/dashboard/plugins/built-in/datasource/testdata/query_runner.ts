// Copyright 2023 xObserve.io Team

// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery } from 'types/dashboard'
import { TimeRange } from 'types/time'
import { Datasource } from 'types/datasource'
import { Field, SeriesData } from 'types/seriesData'
import { getMockAlerts } from './mocks/alerts'
import { externalPanelPlugins } from '../../../external/plugins'
import { builtinPanelPlugins } from '../../plugins'

export const run_testdata_query = async (
  panel: Panel,
  q: PanelQuery,
  range: TimeRange,
  ds: Datasource,
) => {
  let data: any

  const p = builtinPanelPlugins[panel.type] ?? externalPanelPlugins[panel.type]
  if (p && p.mockDataForTestDataDs) {
    data = p.mockDataForTestDataDs(panel, range, panel.datasource, q)
  }

  return {
    error: null,
    data: data ?? [],
  }
}

export const query_testdata_alerts = (
  panel: Panel,
  timeRange: TimeRange,
  ds: Datasource,
  query: PanelQuery,
) => {
  const alertsData = getMockAlerts(timeRange)
  alertsData.data['fromDs'] = ds.type
  return {
    error: null,
    data: alertsData.data,
  }
}

export const transformSchemaDataToSeriesData = (schemaData) => {
  const seriesList: SeriesData[] = []
  for (const sd of schemaData) {
    const fields = sd.schema.fields
    const values = sd.data.values
    const seriesFields: Field[] = []
    let seriesName
    fields.forEach((field, i) => {
      seriesFields.push({
        name: field.name,
        type: field.type,
        values: values[i],
      })
      if (field.config.displayNameFromDS) {
        seriesName = field.config.displayNameFromDS
      }
    })

    const series: SeriesData = {
      queryId: sd.schema.refId,
      name: seriesName,
      rawName: seriesName,
      fields: seriesFields,
    }
    seriesList.push(series)
  }

  return seriesList
}

export const testTestData = async (ds: Datasource) => {
  return true
}
