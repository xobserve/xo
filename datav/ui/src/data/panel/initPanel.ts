// Copyright 2023 xObserve.io Team

import { Panel, PanelDatasource, PanelTypeRow } from 'types/dashboard'
import { initPanelStyles } from './initStyles'
import { DatasourceMaxDataPoints, DatasourceMinInterval } from '../constants'
import { builtinPanelPlugins } from 'src/views/dashboard/plugins/built-in/plugins'
import { externalPanelPlugins } from 'src/views/dashboard/plugins/external/plugins'
import { PanelTypeGraph } from 'src/views/dashboard/plugins/built-in/panel/graph/types'
import { $datasources } from 'src/views/datasource/store'
import { DatasourceTypeTestData } from 'src/views/dashboard/plugins/built-in/datasource/testdata/types'
import { first } from 'lodash'

export const initPanelType = PanelTypeGraph
export const initPanel = (id?) => {
  const plugin =
    builtinPanelPlugins[initPanelType] ?? externalPanelPlugins[initPanelType]
  const p: Panel = {
    desc: '',
    collapsed: false,
    type: initPanelType,
    gridPos: { x: 0, y: 0, w: 12, h: 20 },
    plugins: {
      [initPanelType]: plugin.settings.initOptions,
    },
    datasource: initDatasource(),
    styles: initPanelStyles,
    overrides: [],
    valueMapping: null,
    transform: `function transform(rawData,lodash, moment) {
    // for demonstration purpose: how to use 'moment'
    // const t = moment(new Date()).format("YY-MM-DD HH:mm::ss")
    return rawData
}`,
    enableTransform: false,
    enableConditionRender: false,
    conditionRender: {
      type: 'variable',
      value: '',
    },
    enableScopeTime: false,
    scopeTime: null,
  }

  if (id) {
    p.id = id
    p.title = `New panel ${id}`
  }

  return p
}

export const initRowPanel = (id) => {
  const p = {
    id: id,
    title: 'New row',
    desc: '',
    collapsed: false,
    type: PanelTypeRow,
    gridPos: { x: 0, y: 0, w: 24, h: 1.5 },
  }

  return p
}

export const initDatasource = () => {
  const datasources = $datasources.get()
  const ds =
    datasources?.find((ds) => ds.type == DatasourceTypeTestData) ??
    first(datasources)
  return {
    id: ds?.id,
    type: ds?.type,
    queryOptions: {
      minInterval: DatasourceMinInterval,
      maxDataPoints: DatasourceMaxDataPoints,
    },
    queries: [
      {
        id: 65,
        metrics: '',
        legend: '',
        visible: true,
        data: {},
      },
    ],
  }
}
