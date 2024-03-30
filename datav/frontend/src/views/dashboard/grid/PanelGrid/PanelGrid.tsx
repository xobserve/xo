// Copyright 2023 xobserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Panel, PanelProps, PanelQuery } from 'types/dashboard'
import {
  Box,
  Center,
  useColorMode,
  useToast,
} from '@chakra-ui/react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DatasourceMaxDataPoints,
  DatasourceMinInterval,
  PANEL_HEADER_HEIGHT,
} from 'src/data/constants'
import { cloneDeep, isEqual, isFunction } from 'lodash'
import { TimeRange } from 'types/time'
import { Variable } from 'types/variable'
import {
  hasVariableFormat,
  replaceQueryWithVariables,
} from 'utils/variable'
import useBus, { dispatch } from 'use-bus'
import { getCurrentTimeRange } from 'src/components/DatePicker/TimePicker'
import {
  OnClonePanel,
  PanelDataEvent,
  PanelForceRebuildEvent,
  PanelForceRequeryEvent,
  PanelVariableChangeEvent,
  TimeChangedEvent,
} from 'src/data/bus-events'
import PanelBorder from 'src/components/largescreen/components/Border'
import { useDedupEvent } from 'hooks/useDedupEvent'
import { calculateInterval } from 'utils/datetime/range'
import { useSearchParam } from 'react-use'
import React from 'react'
import { useStore } from '@nanostores/react'
import { genDynamicFunction } from 'utils/dashboard/dynamicCall'
import lodash from 'lodash'
import moment from 'moment'
import { paletteColorNameToHex } from 'utils/colors'
import { isEmpty } from 'utils/validate'
import { $variables } from 'src/views/variables/store'
import { getDatasource } from 'utils/datasource'
import { jsonToEqualPairs, parseVariableFormat } from 'utils/format'
import { builtinVariables } from 'src/data/variable'
import Loading from 'src/components/loading/Loading'
import {
  AlertGroup,
  AlertRule,
} from 'src/views/dashboard/plugins/built-in/panel/alert/types'
import ErrorBoundary from 'src/components/ErrorBoudary'
import { $datasources } from 'src/views/datasource/store'
import { Datasource } from 'types/datasource'
import {
  externalDatasourcePlugins,
  externalPanelPlugins,
} from '../../plugins/external/plugins'
import { $copiedPanel, $dashboard } from '../../store/dashboard'
import {
  builtinDatasourcePlugins,
  builtinPanelPlugins,
} from '../../plugins/built-in/plugins'
import { PanelTypeAlert } from '../../plugins/built-in/panel/alert/types'
import { PanelTypeGraph } from '../../plugins/built-in/panel/graph/types'
import { DatasourceTypeTestData } from '../../plugins/built-in/datasource/testdata/types'
import { locale } from 'src/i18n/i18n'
import { Lang } from 'types/misc'
import { initVariableSelected } from 'src/views/variables/Loader'
import PanelHeader from './PanelHeader'

interface PanelGridProps {
  dashboardId: string
  panel: Panel
  onRemovePanel?: any
  onHidePanel?: any
  sync: any
  onVariablesChange?: any
  width: number
  height: number
  initData?: any
}

export const PanelGrid = memo((props: PanelGridProps) => {
  const [forceRenderCount, setForceRenderCount] = useState(0)
  const [forceQueryCount, setForceQueryCount] = useState(0)
  const [depsInited, setDepsInited] = useState(false)
  const [tr, setTr] = useState<TimeRange>(getCurrentTimeRange())
  const depsCheck = useRef(null)
  const variables = useStore($variables)
  const [pvars, setPvars] = useState<Variable[]>(cloneDeep(props.panel.variables))

  useEffect(() => {
    if (!isEmpty(pvars)) {
      initVariableSelected(pvars)
    }
    var retryNum = 0
    depsCheck.current = setInterval(() => {
      if (retryNum > 5) {
        setDepsInited(true)
        clearInterval(depsCheck.current)
        depsCheck.current = null
        return
      }

      let inited = true
      const vars = $variables.get()
      for (const q of props.panel.datasource.queries) {
        const f = parseVariableFormat(q.metrics)
        for (const v of f) {
          if (builtinVariables.includes(v)) {
            continue
          }
          const variable = vars.find((v1) => v1.name == v)
          if (variable?.values === undefined) {
            inited = false
          }
        }
      }

      if (inited) {
        setDepsInited(true)
        clearInterval(depsCheck.current)
        depsCheck.current = null
      } else {
        retryNum += 1
      }
    }, 100)
  }, [])
  useBus(
    (e) => {
      return e.type == TimeChangedEvent
    },
    (e) => {
      setTr(e.data)
    },
  )

  useBus(
    (e) => {
      return e.type == PanelVariableChangeEvent && e.panelId == props.panel.id
    },
    (e) => {
      const vars = []
      for (const v of pvars) {
        if (v.id == e.variable.id) {
          vars.push(cloneDeep(e.variable))
        } else {
          vars.push(v)
        }
      }
      setPvars(vars)
    },
  )

  // rebuild pane ui
  useDedupEvent(PanelForceRebuildEvent + props.panel.id, () => {
    console.log('panel is forced to rebuild!', props.panel.id)
    setForceRenderCount((f) => f + 1)
  })

  // re-query panel data
  useDedupEvent(PanelForceRequeryEvent + props.panel.id, () => {
    console.log('panel is forced to rebuild!', props.panel.id)
    for (const q of props.panel.datasource.queries) {
      const id = formatQueryId(
        props.panel.datasource.id,
        props.dashboardId,
        props.panel.id,
        q.id,
        props.panel.type,
      )
      prevQueries.delete(id)
      prevQueryData.delete(id)
    }

    setForceQueryCount((f) => f + 1)
  })

  return (
    <>
      {depsInited && (
        <PanelComponent
          key={props.panel.id + forceRenderCount}
          {...props}
          timeRange={tr}
          variables={variables}
          forceQuery={forceQueryCount}
          pvariables={pvars}
        />
      )}
    </>
  )
})

interface PanelComponentProps extends PanelGridProps {
  width: number
  height: number
  timeRange: TimeRange
  variables: Variable[]
  pvariables: Variable[]
  forceQuery: number
}

export const prevQueries = new Map()
export const prevQueryData = new Map()
export const PanelComponent = ({
  dashboardId,
  panel,
  variables,
  pvariables,
  onRemovePanel,
  onHidePanel,
  width,
  height,
  sync,
  timeRange: timeRange0,
  forceQuery,
  initData,
}: PanelComponentProps) => {
  const lang = useStore(locale)
  const toast = useToast()
  const [panelData, setPanelData] = useState<any[]>(initData)
  const [queryError, setQueryError] = useState<string>()
  const edit = useSearchParam('edit')
  const [loading, setLoading] = useState(false)
  const datasources = useStore($datasources)
  const [onHover, setOnHover] = useState(false)
  const dashboard = useStore($dashboard)
  const { colorMode } = useColorMode()
  const timeRange = cloneDeep(
    panel.enableScopeTime && panel.scopeTime ? panel.scopeTime : timeRange0,
  )
  if (typeof timeRange.start == 'string') {
    timeRange.start = new Date(timeRange.start)
    timeRange.end = new Date(timeRange.end)
  }
  useEffect(() => {
    return () => {
      // delete data query cache when panel is unmounted
      if (panel.type == PanelTypeAlert) {
        for (const q of panel.datasource.queries) {
          const id = formatQueryId(
            panel.datasource.id,
            dashboardId,
            panel.id,
            q.id,
            panel.type,
          )
          prevQueries.delete(id)
        }
      }
    }
  }, [])

  const queryH = useRef(null)
  useEffect(() => {
    if (initData) {
      return
    }
    if (queryH.current) {
      clearTimeout(queryH.current)
    }
    queryH.current = setTimeout(() => {
      queryData(panel, dashboardId)
    }, 200)
  }, [
    panel.datasource,
    timeRange0,
    variables,
    pvariables,
    datasources,
    panel.enableScopeTime,
    panel.scopeTime,
    forceQuery,
  ])

  const queryData = async (panel: Panel, dashboardId: string) => {
    const panelPlugin =
      builtinPanelPlugins[panel.type] ?? externalPanelPlugins[panel.type]
    if (panelPlugin?.settings.disableAutoQuery) {
      setPanelData([])
      return
    }
    console.time('time used - query data for panel:')
    const ds = panel.datasource
    const datasource = getDatasource(ds.id)
    if (!datasource) {
      setPanelData([])
      toast({
        title:
          lang == Lang.EN
            ? `Datasource<id=${ds.id},type=${ds.type}> not exist on panel <${panel.title}>`
            : `图表 <${panel.title}> 中的数据源 <id=${ds.id},type=${ds.type}> 不存在`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    let data = []
    let needUpdate = false
    const intervalObj = calculateInterval(
      timeRange,
      ds.queryOptions.maxDataPoints ?? DatasourceMaxDataPoints,
      isEmpty(ds.queryOptions.minInterval)
        ? DatasourceMinInterval
        : ds.queryOptions.minInterval,
    )
    const interval = intervalObj.intervalMs / 1000

    const plugin =
      builtinDatasourcePlugins[datasource.type] ??
      externalDatasourcePlugins[datasource.type]
    if (!plugin) {
      setQueryError('Datasource plugin not found: ' + datasource.type)
      setPanelData([])
      return
    }

    setLoading(true)
    if (panel.type == PanelTypeAlert) {
      const res = await queryAlerts(
        panel,
        timeRange,
        panel.plugins.alert.filter.datasources,
        panel.plugins.alert.filter.httpQuery,
        datasources,
      )
      setQueryError(res.error)
      data = res.data
    } else {
      const promises = []
      for (const q0 of ds.queries) {
        if (!q0.visible) {
          continue
        }
        const q: PanelQuery = { ...cloneDeep(q0), interval }
        replaceQueryWithVariables(
          q,
          datasource.type,
          intervalObj.interval,
          timeRange,
          pvariables,
        )
        if (
          datasource.type != DatasourceTypeTestData &&
          hasVariableFormat(q.metrics)
        ) {
          // there are variables still not replaced, maybe because variable's loadValues has not completed
          continue
        }

        const id = formatQueryId(ds.id, dashboardId, panel.id, q.id, panel.type)
        const prevQuery = prevQueries.get(id)
        const currentQuery = [q, timeRange, datasource.type]
        if (isEqual(prevQuery, currentQuery)) {
          const d = prevQueryData[id]
          if (d) {
            data.push(d)
          }
          setQueryError(null)
          console.log('query data from cache!', panel.id)
          continue
        }

        needUpdate = true
        // console.log("re-query data! metrics id:", q.id, " query id:", queryId)

        let res
        const p =
          builtinDatasourcePlugins[datasource.type] ??
          externalDatasourcePlugins[datasource.type]
        if (p && p.runQuery) {
          res = p.runQuery(panel, q, timeRange, datasource)
        }

        promises.push({
          h: res,
          id: id,
          query: currentQuery,
        })
      }
      if (promises.length > 0) {
        const res0 = await Promise.allSettled(promises.map((p) => p.h))
        res0.forEach((res0, i) => {
          if (res0.status == 'fulfilled') {
            const res = res0.value
            if (res) {
              const id = promises[i].id
              const currentQuery = promises[i].query
              setQueryError(res.error)
              // currently only cache not empty data
              if (!isEmpty(res.data)) {
                data.push(res.data)
                prevQueryData[id] = res.data
                prevQueries.set(id, currentQuery)
              }
            }
          } else {
            console.log('query data error:', res0.reason)
            setQueryError(res0.reason)
          }
        })
      }
    }

    if (needUpdate) {
      console.log('query data and set panel data:', panel.id, data)
      setPanelData(data)
    } else {
      if (!isEqual(panelData, data)) {
        setPanelData(data)
      }
    }

    setLoading(false)

    console.timeEnd('time used - query data for panel:')
  }

  const onCopyPanel = useCallback((panel, type) => {
    if (type == 'copy') {
      toast({
        title: 'Copied',
        description:
          'Panel copied, you can use it through **Add Panel** button',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      $copiedPanel.set(cloneDeep(panel))
    } else {
      dispatch({ type: OnClonePanel, data: panel.id })
    }
  }, [])

  const panelBodyHeight = height - PANEL_HEADER_HEIGHT
  const panelInnerHeight = isEmpty(panel.title) ? height : panelBodyHeight // 10px padding top and bottom of panel body
  const panelInnerWidth = width // 10px padding left and right of panel body

  // console.log("panel grid rendered, panel data: ", panelData)
  const data = useMemo(() => {
    const d = cloneDeep(panelData)
    let res = d
    if (panel.enableTransform && d) {
      const transform = genDynamicFunction(panel.transform)
      if (isFunction(transform)) {
        try {
          const tData = transform(d, lodash, moment)
          console.log('panel grid rendered, transform data: ', tData)
          res = tData
        } catch (error) {
          toast({
            title: 'Transform data error',
            description: error.message,
            status: 'error',
            duration: 3000,
          })
          console.error(error)
        }
      } else {
        res = d
      }
    }

    if (edit == panel.id.toString()) {
      dispatch({ type: PanelDataEvent + panel.id, data: res })
    }

    return res
  }, [panel.transform, panel.enableTransform, panelData])

  let backgroundColor: string = "";
  if (dashboard.data.styles.panelBg) {
    if (dashboard.data.styles.panelBg.enabled) {
      if (colorMode == 'dark') {
        backgroundColor = dashboard.data.styles.panelBg?.darkThemeColor
      } else {
        backgroundColor = dashboard.data.styles.panelBg?.lightThemeColor
      }
    }
  }
  if (panel.styles.background) {
    if (panel.styles.background.enabled) {
      if (colorMode == 'dark') {
        backgroundColor = panel.styles.background?.darkThemeColor
      } else {
        backgroundColor = panel.styles.background?.lightThemeColor
      }
    }
  }

  return (
    <Box
      height={height}
      width={width}
      className={
        (panel.styles.border == 'Normal' && 'bordered') +
        (dashboard.data.styles.bgEnabled ? ' panel-bg-alpha' : ' panel-bg')
      }
      position='relative'
      onMouseEnter={() => setOnHover(true)}
      onMouseLeave={() => setOnHover(false)}
      backgroundColor={paletteColorNameToHex(
        backgroundColor,
        colorMode,
      )}
    >
      {data && (
        <Box overflow='hidden'>
          <PanelHeader
            dashboard={dashboard}
            panel={panel}
            data={panelData}
            queryError={queryError}
            onCopyPanel={onCopyPanel}
            onRemovePanel={onRemovePanel}
            onHidePanel={onHidePanel}
            loading={loading}
            onHover={onHover}
            pvariables={pvariables}
          />
          <ErrorBoundary>
            <Box
              // panel={panel}
              height={panelInnerHeight}
              marginLeft={
                panel.type == PanelTypeGraph
                  ? -10 + panel.styles.marginLeft + 'px'
                  : panel.styles.marginLeft + 'px'
              }
              marginTop={panel.styles.marginTop + 'px'}
            >
              <CustomPanelRender
                dashboardId={dashboardId}
                teamId={dashboard.ownedBy}
                panel={panel}
                data={data}
                height={panelInnerHeight - panel.styles.heightReduction}
                width={panelInnerWidth - panel.styles.widthReduction}
                sync={sync}
                timeRange={
                  panel.enableScopeTime && panel.scopeTime
                    ? panel.scopeTime
                    : timeRange0
                }
              />
            </Box>
          </ErrorBoundary>
        </Box>
      )}
      {loading && (
        <Box position='absolute' top='-2px' right='0'>
          <Loading size='sm' />
        </Box>
      )}
      <Box
        position='absolute'
        top='0'
        left='0'
        right='0'
        bottom='0'
        zIndex={-1}
        overflow='hidden'
      >
        <PanelBorder
          width={width}
          height={height}
          border={panel.styles?.border}
        >
          {' '}
          <Box></Box>
        </PanelBorder>
      </Box>
    </Box>
  )
}

const CustomPanelRender = memo((props: PanelProps) => {
  const plugin =
    builtinPanelPlugins[props.panel.type] ??
    externalPanelPlugins[props.panel.type]
  const PluginPanel = plugin && plugin.panel
  if (PluginPanel) {
    return <PluginPanel {...props} />
  }
  return (
    <Center height={props.height}>
      Panel plugin not found: {props.panel.type}
    </Center>
  )
})





const formatQueryId = (
  datasourceId,
  dashboardId,
  panelId,
  queryId,
  panelType,
) => {
  let tp = panelType

  // because some panels has their own data parser in datasource query runner
  // so we need to use panel type to make the cache working correctly
  // switch (panelType) {
  //     case PanelType.NodeGraph:
  //         tp = PanelType.NodeGraph
  //         break;
  //     case PanelType.Trace:
  //         tp = PanelType.Trace
  //         break
  //     case PanelType.GeoMap:
  //         tp = PanelType.GeoMap
  //         break
  //     case PanelType.Log:
  //         tp = PanelType.Log
  //         break
  //     case PanelType.Alert:
  //         tp = PanelType.Alert
  //         break
  //     default:
  //         const p = externalPanelPlugins[panelType]
  //         if (p) {
  //             tp = panelType
  //         } else {
  //             tp = "seriesData"
  //         }
  //         break;
  // }
  return `${datasourceId}-${dashboardId}-${panelId}-${queryId}-${tp}`
}

export const queryAlerts = async (
  panel: Panel,
  timeRange: TimeRange,
  dsIds: number[],
  httpQuery: PanelQuery,
  datasources: Datasource[],
) => {
  let result = {
    error: null,
    data: [],
  }
  for (const dsID of dsIds) {
    const ds = datasources.find((ds) => ds.id === dsID)
    let res
    const p =
      builtinDatasourcePlugins[ds.type] ?? externalDatasourcePlugins[ds.type]
    if (p && p.queryAlerts) {
      res = await p.queryAlerts(panel, timeRange, ds, httpQuery)
    }

    result.error = res.error

    result.data = result.data.concat(res.data)
  }

  const data0: { groups: AlertGroup[]; fromDs: string }[] = result.data
  const data: AlertRule[] = []
  for (const d of data0) {
    for (const group of d.groups) {
      for (const rule of group.rules) {
        const r = cloneDeep(rule)
        r.fromDs = d.fromDs
        r.groupName = group.name
        r.groupNamespace = group.file

        data.push(r)
        const ruleLabelKeys = Object.keys(r.labels)
        for (const alert of r.alerts) {
          delete alert.labels.alertname
          for (const k of ruleLabelKeys) {
            if (alert.labels[k] == r.labels[k]) {
              delete alert.labels[k]
            }
          }
          alert.name = r.name + jsonToEqualPairs({ ...alert.labels })
        }
      }
    }
  }

  result.data = data
  return result
}


