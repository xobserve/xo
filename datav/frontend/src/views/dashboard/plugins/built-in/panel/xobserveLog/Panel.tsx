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

import {
  Box,
  Center,
  Text,
  useDisclosure,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react'
import { PanelProps } from 'types/dashboard'
import React, { memo, useMemo, useState } from 'react'
import { xobserveLogPanel, PanelType } from './types'
import ColumnResizableTable from 'components/table/ColumnResizableTable'
import { ColumnDef } from '@tanstack/react-table'
import {
  DatasourceMaxDataPoints,
  DatasourceMinInterval,
  IsSmallScreen,
} from 'src/data/constants'
import { isEmpty } from 'utils/validate'
import NoData from 'src/views/dashboard/components/PanelNoData'
import ErrorOkChart from '../../../components/charts/ErrorOkChart'
import Search, { OnLogSearchChangeEvent } from './Search'
import { setDateTime } from 'components/DatePicker/DatePicker'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { builtinDatasourcePlugins } from '../../plugins'
import { $datasources } from 'src/views/datasource/store'
import { externalDatasourcePlugins } from '../../../external/plugins'
import { cloneDeep } from 'lodash'
import { calculateInterval } from 'utils/datetime/range'
import { DataFormat } from 'types/format'
import LogDetail from './LogDetail'
import { Field } from 'types/seriesData'
import { formatLogTimestamp } from './utils'
import { dispatch } from 'use-bus'
import { paletteColorNameToHex } from 'utils/colors'
import { replaceQueryWithVariables } from 'utils/variable'

interface Props extends PanelProps {
  panel: xobserveLogPanel
}

const PanelWrapper = memo((props: Props) => {
  const data = props.data.flat()

  if (isEmpty(data)) {
    return (
      <>
        {props.panel.plugins[PanelType].showSearch && (
          <Search panel={props.panel} />
        )}
        <Center height='100%'>
          <NoData />
        </Center>
      </>
    )
  }

  return (
    <>
      {props.panel.plugins[PanelType].showSearch && (
        <Search panel={props.panel} />
      )}
      {!isLogData(data[0]) ? (
        <Center height='100%'>
          <VStack>
            <Text fontWeight={500} fontSize='1.1rem'>
              Data format not support!
            </Text>
            <Text className='color-text'>
              Try to change to xobserve datasource to use this panel
            </Text>
          </VStack>
        </Center>
      ) : (
        <Panel {...props} data={data[0]} />
      )}
    </>
  )
})

export default PanelWrapper

const queryClient = new QueryClient()
const Panel = (props: Props) => {
  const { panel, data } = props

  const [isMobileScreen] = useMediaQuery(IsSmallScreen)
  const [displayLogCount, setDisplayLogs] = useState<number>(0)
  const [selectedLog, setSelectedLog] = useState<Field[]>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const options = panel.plugins[PanelType]

  const defaultColumns: ColumnDef<any>[] = useMemo(() => {
    return options.columns.displayColumns.map((c, i) => {
      const base: any = {
        accessorKey: c.key,
        header: c.name ?? c.key,
        size:
          typeof c.width == 'number'
            ? c.width
            : isMobileScreen
            ? c.width[0]
            : c.width[1],
      }

      if (c.key == 'timestamp') {
        base.cell = (info) => (
          <Text opacity={0.6} fontWeight={500}>
            {info.getValue() as any}
          </Text>
        )
      } else if (c.key == 'severity') {
        base.cell = (info) => {
          const severity = info.getValue() as any
          return (
            <Text className={severity == 'error' && 'error-text'}>
              {severity}
            </Text>
          )
        }
      } else if (c.key.startsWith('resources.')) {
        const name = c.key.replace('resources.', '')
        base.cell = (info) => {
          return <Text>{info.row.original.resources_string[name]}</Text>
        }
      } else if (c.key.startsWith('attributes.')) {
        const name = c.key.replace('attributes.', '')
        base.cell = (info) => {
          if (info.row.original.attributes_string[name]) {
            return <Text>{info.row.original.attributes_string[name]}</Text>
          }
          if (info.row.original.attributes_int64[name]) {
            return <Text>{info.row.original.attributes_int64[name]}</Text>
          }

          if (info.row.original.attributes_float64[name]) {
            return <Text>{info.row.original.attributes_float64[name]}</Text>
          }

          return <Text></Text>
        }
      }

      return base
    })
  }, [isMobileScreen, options.logline.wrapLine, options.columns.displayColumns])

  const logs = useMemo(() => {
    return parseLogs(data, isMobileScreen)
  }, [isMobileScreen, data])

  const totalLogs = useMemo(() => {
    const d: any[] = data.chart.data
    const total = d.reduce((total, b) => {
      return total + b[1] + b[2]
    }, 0)
    return total
  }, [data.chart])

  const onClickChart = (ts, level, step) => {
    const from = Number(ts)
    const to = Number(ts) + Number(step)
    setDateTime(from, to)
  }

  const onLoadLogsPage = async (page) => {
    const ds = $datasources.get().find((ds) => ds.id == panel.datasource.id)
    const plugin =
      builtinDatasourcePlugins[ds.type] ?? externalDatasourcePlugins[ds.type]
    if (plugin) {
      const query = cloneDeep(panel.datasource.queries[0])
      const intervalObj = calculateInterval(
        props.timeRange,
        panel.datasource.queryOptions.maxDataPoints ?? DatasourceMaxDataPoints,
        isEmpty(panel.datasource.queryOptions.minInterval)
          ? DatasourceMinInterval
          : panel.datasource.queryOptions.minInterval,
      )
      query.interval = intervalObj.intervalMs / 1000

      replaceQueryWithVariables(
        query,
        ds.type,
        intervalObj.interval,
        props.timeRange,
      )
      const res = await plugin.runQuery(panel, query, props.timeRange, ds, {
        page: page,
      })

      if (res.data.length > 0) {
        const logs = parseLogs(res.data[0], isMobileScreen)
        return logs
      } else {
        return []
      }
    }
  }

  const onLogRowClick = async (log) => {
    const rawlog = data.logs.find((l) => l.id == log.id)
    const ds = $datasources.get().find((ds) => ds.id == panel.datasource.id)
    const plugin =
      builtinDatasourcePlugins[ds.type] ?? externalDatasourcePlugins[ds.type]
    if (plugin) {
      const query = cloneDeep(panel.datasource.queries[0])
      const intervalObj = calculateInterval(
        props.timeRange,
        panel.datasource.queryOptions.maxDataPoints ?? DatasourceMaxDataPoints,
        isEmpty(panel.datasource.queryOptions.minInterval)
          ? DatasourceMinInterval
          : panel.datasource.queryOptions.minInterval,
      )
      query.interval = intervalObj.intervalMs / 1000
      query.data['format'] = DataFormat.Table
      const res = await plugin.runQuery(panel, query, props.timeRange, ds, {
        logTs: rawlog.timestamp,
        logId: rawlog.id,
      })

      if (res.data.length > 0) {
        const logRawDetail = res.data[0].fields
        setSelectedLog(logRawDetail)
        onOpen()
      }
    }
  }

  const chartHeight = options.chart.height
  const showLogs = options.showLogs && logs.length > 0
  const showChart = options.showChart && data.chart && logs.length > 0
  const highlights = useMemo(() => {
    const highlights = []
    if (options.columns.highlight) {
      for (const h of options.columns.highlight) {
        if (h.value === null) {
          highlights.push({
            column: null,
            match: null,
            color: paletteColorNameToHex(h.color),
          })
          continue
        }

        const v = h.value.split('=')
        highlights.push({
          column: v[0],
          match: v[1],
          color: paletteColorNameToHex(h.color),
        })
      }
    }
    return highlights
  }, [options.columns.highlight])

  return (
    <>
      <Box px='2' height='100%' id='xobserve-log-panel'>
        {showChart && (
          <Box
            key={showLogs as any}
            height={showLogs ? chartHeight : props.height}
            mb='2'
          >
            <ErrorOkChart
              data={data.chart}
              onClick={onClickChart}
              totalCount={totalLogs}
              displayCount={showLogs ? displayLogCount : null}
              options={panel.plugins[PanelType].chart}
            />
          </Box>
        )}
        {showLogs && (
          <QueryClientProvider client={queryClient}>
            <ColumnResizableTable
              highlightRow={selectedLog?.find((f) => f.name == 'id').values[0]}
              columns={defaultColumns}
              data={logs}
              wrapLine={options.logline.wrapLine}
              fontSize={options.logFontSize}
              headerFontSize={options.headerFontSize}
              allowOverflow={options.logline.allowOverflow}
              height={props.height - (showChart ? chartHeight : 0)}
              totalRowCount={totalLogs}
              onLoadPage={onLoadLogsPage}
              onRowsCountChange={setDisplayLogs}
              onRowClick={onLogRowClick}
              columnHighlights={highlights}
            />
          </QueryClientProvider>
        )}
        {logs.length == 0 && (
          <Center height='100%'>
            <NoData />
          </Center>
        )}
      </Box>
      {selectedLog && (
        <LogDetail
          log={selectedLog}
          isOpen={isOpen}
          onClose={() => {
            // setSelectedLog(null)
            onClose()
          }}
          onSearch={(v, isNew) =>
            dispatch({
              type: OnLogSearchChangeEvent + panel.id,
              data: {
                query: v,
                isNew,
              },
            })
          }
        />
      )}
    </>
  )
}

const isLogData = (data: any) => {
  if (!data.logs) {
    return false
  }

  return true
}

const parseLogs = (data, isMobileScreen) => {
  const logs = []
  for (const log of data.logs) {
    logs.push({
      ...log,
      timestamp: formatLogTimestamp(log.timestamp, isMobileScreen),
    })
  }

  return logs
}
