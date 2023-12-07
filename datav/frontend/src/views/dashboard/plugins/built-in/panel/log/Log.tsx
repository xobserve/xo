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

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Center,
  Flex,
  StackDivider,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { PanelProps } from 'types/dashboard'
import { LogSeries, Log } from './types'
import { FaFilter } from 'react-icons/fa'
import LogToolbar from './components/Toolbar'
import storage from 'utils/localStorage'
import LogItem from './components/LogItem'
import { getLabelFromId, isLogSeriesData } from './utils'
import { clone, isEqual, isFunction, sortBy } from 'lodash'
import LogChart from './components/Chart'
import { isEmpty } from 'utils/validate'
import CustomScrollbar from 'src/components/CustomScrollbar/CustomScrollbar'
import { paletteMap } from 'utils/colors'
import { ColorGenerator } from 'utils/colorGenerator'
import NoData from 'src/views/dashboard/components/PanelNoData'
import { genDynamicFunction } from 'utils/dashboard/dynamicCall'
import lodash from 'lodash'
import moment from 'moment'

interface LogPanelProps extends PanelProps {
  data: LogSeries[][]
}

const LogPanelWrapper = memo((props: LogPanelProps) => {
  if (isEmpty(props.data)) {
    return (
      <Center height='100%'>
        <NoData />
      </Center>
    )
  }

  return (
    <>
      {!isLogSeriesData(props.data[0][0]) ? (
        <Center height='100%'>
          <VStack>
            <Text fontWeight={500} fontSize='1.1rem'>
              Data format not support!
            </Text>
            <Text className='color-text'>
              Try to change to Testdata or Loki datasource, then look into its
              data format in Panel Debug
            </Text>
          </VStack>
        </Center>
      ) : (
        <LogPanel {...props} />
      )}
    </>
  )
})

export default LogPanelWrapper

const ToolbarStorageKey = 'log-toolbar-'
const LogViewOptionsStorageKey = 'log-view-'
const LogPanel = (props: LogPanelProps) => {
  const { dashboardId, panel } = props
  const toast = useToast()
  const storageKey = ToolbarStorageKey + dashboardId + panel.id
  const [toolbarOpen, setToolbarOpen] = useState(
    storage.get(storageKey) ?? props.panel.plugins.log.toolbar.defaultOpen,
  )
  const [collaseAll, setCollapeAll] = useState(true)
  const [search, setSearch] = useState('')
  const [labelSearch, setLabelSearch] = useState<string>('')
  const [active, setActive] = useState<string[]>([])

  const data: Log[] = useMemo(() => {
    const res: Log[] = []
    let transform
    if (props.panel.plugins.log.enableTransform) {
      const tf = genDynamicFunction(props.panel.plugins.log.transform)
      if (isFunction(tf)) {
        transform = tf
      } else {
        toast({
          title: 'Invalid log transform function2',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        console.log('Invalid log transform function1', transform)
      }
    }

    let toasted = false
    for (const s of props.data.flat()) {
      for (const l of s.values) {
        const l1 = {
          labels: s.labels,
          timestamp: l[0],
          content: l[1],
          highlight: null,
        }
        let nl = l1
        if (transform) {
          try {
            nl = transform(l1, lodash, moment)
          } catch (error) {
            if (!toasted) {
              toast({
                title: 'Invalid log transform function2',
                status: 'warning',
                duration: 3000,
                isClosable: true,
              })
              console.log('Invalid log transform function2', error.message)
              toasted = true
            }
          }
        }
        res.push(nl)
      }
    }

    return res
  }, [
    props.data,
    props.panel.plugins.log.enableTransform,
    props.panel.plugins.log.transform,
  ])

  const generator = useMemo(() => {
    const palette = paletteMap[panel.styles.palette]
    return new ColorGenerator(palette)
  }, [panel.styles.palette])

  useEffect(() => {
    if (!panel.plugins.log.toolbar.show) {
      storage.remove(storageKey)
    }
  }, [panel.plugins.log.toolbar.show])

  const onToobarOpen = () => {
    if (!toolbarOpen) {
      storage.set(storageKey, true)
    } else {
      storage.remove(storageKey)
    }

    setToolbarOpen(!toolbarOpen)
  }

  const onCollapseAll = useCallback((v) => {
    setCollapeAll(v)
  }, [])

  const onSearchChange = useCallback((v: string) => {
    setSearch(v.toLowerCase().trim())
  }, [])

  const onSearchLabel = useCallback((v: string) => {
    setLabelSearch(v.toLowerCase().trim())
  }, [])

  const onSelectLabel = useCallback((id) => {
    setActive((active) => {
      if (active.includes(id)) {
        return []
      } else {
        return [id]
      }
    })
  }, [])

  const filterData: Log[] = useMemo(() => {
    const activeLabels = []
    for (const l of active) {
      const label = getLabelFromId(l)
      activeLabels.push(label)
    }

    const result: Log[] = []
    for (const v0 of data) {
      const v = clone(v0)
      v.highlight = []
      v.labelHighlight = []

      if (activeLabels.length > 0) {
        let labelExist = false
        for (const l of Object.entries(v0.labels)) {
          for (const al of activeLabels) {
            if (isEqual(al, l)) {
              labelExist = true
            }
          }
        }

        if (!labelExist) continue
      }

      if (labelSearch != '') {
        const searches = labelSearch.split(',')
        let found = true
        for (const s of searches) {
          const s1 = s.trim()
          if (isEmpty(s1)) {
            found = false
            continue
          }

          const [lkey, lvalue] = s1.split('=')
          if (isEmpty(lkey) || isEmpty(lvalue)) {
            found = false
            continue
          }
          v.labelHighlight.push(lkey)

          let found1 = false
          for (const k of Object.keys(v.labels)) {
            const v1 = v.labels[k]?.toLowerCase()
            if (k.toLowerCase() == lkey && v1.match(lvalue)) {
              v.labelHighlight.push(v1)
              found1 = true
              break
            }
          }
          if (!found1) {
            found = false
            break
          }
        }
        if (!found) {
          continue
        }
      }
      const lowerContent = v.content.toLowerCase()
      if (isEmpty(search)) {
        result.push(v)
      } else {
        const isOr = search.includes('||')
        const isAnd = search.includes('&&')
        if (!isOr && !isAnd) {
          if (lowerContent.includes(search)) {
            v.highlight.push(search)
            result.push(v)
          }
        } else {
          if (isOr) {
            const searches = search.split('||')
            for (const s of searches) {
              const s1 = s.trim()
              if (lowerContent.includes(s1)) {
                v.highlight.push(s1)
                result.push(v)
                break
              }
            }
          } else if (isAnd) {
            const searches = search.split('&&')
            let found = true
            for (const s of searches) {
              if (!lowerContent.includes(s.trim())) {
                found = false
                break
              }
            }
            if (found) {
              v.highlight.push(...searches)
              result.push(v)
            }
          }
        }
      }
    }
    return result
  }, [data, search, labelSearch, active])

  const sortedData = useMemo(() => {
    if (panel.plugins.log.orderBy == 'newest') {
      return sortBy(filterData, ['timestamp']).reverse()
    }

    return sortBy(filterData, ['timestamp'])
  }, [filterData, panel.plugins.log.orderBy])

  for (const l of sortedData) {
    if (!isEmpty(panel.plugins.log.styles.highlight)) {
      l.highlight = (l.highlight ?? []).concat(
        panel.plugins.log.styles.highlight
          .split(',')
          .filter((v) => !isEmpty(v)),
      )
    }
  }

  return (
    <>
      <Flex position='relative'>
        {panel.plugins.log.toolbar.show && (
          <Box
            position='absolute'
            right='2'
            top='2'
            zIndex={1}
            onClick={onToobarOpen}
            fontSize='0.7rem'
            opacity='0.4'
            cursor='pointer'
            p='2px'
            className={toolbarOpen ? 'color-text' : null}
          >
            <FaFilter />
          </Box>
        )}
        <CustomScrollbar>
          <Box
            height={props.height}
            maxHeight={props.height}
            width={
              props.width - (toolbarOpen ? panel.plugins.log.toolbar.width : 1)
            }
            transition='all 0.3s'
            pt='2'
          >
            {panel.plugins.log.chart.show && (
              <Box
                className='log-panel-chart'
                height={panel.plugins.log.chart.height}
              >
                <LogChart
                  data={sortedData}
                  panel={panel}
                  width={
                    props.width -
                    (toolbarOpen ? panel.plugins.log.toolbar.width : 1)
                  }
                  viewOptions={{
                    barType: isEmpty(panel.plugins.log.chart.categorize)
                      ? 'total'
                      : 'labels',
                  }}
                  colorGenerator={generator}
                  onSelectLabel={onSelectLabel}
                  activeLabels={active}
                />
              </Box>
            )}
            <VStack
              alignItems='left'
              divider={
                panel.plugins.log.styles.showlineBorder && <StackDivider />
              }
              mt='1'
              pb='2'
            >
              {sortedData.map((log) => (
                <LogItem
                  log={log}
                  panel={panel}
                  collapsed={collaseAll}
                  width={props.width}
                  colorGenerator={generator}
                />
              ))}
            </VStack>
          </Box>
        </CustomScrollbar>

        {
          <Box
            className='bordered-left'
            height={props.height}
            maxHeight={props.height}
            width={toolbarOpen ? panel.plugins.log.toolbar.width : 0}
            transition='all 0.3s'
          >
            <CustomScrollbar>
              {toolbarOpen && (
                <LogToolbar
                  panel={panel}
                  onCollapseAll={onCollapseAll}
                  onSearchChange={onSearchChange}
                  onLabelSearch={onSearchLabel}
                  height={props.height}
                  currentLogsCount={filterData.length}
                />
              )}
            </CustomScrollbar>
          </Box>
        }
        {sortedData.length == 0 && (
          <Text position='absolute' left='calc(50% - 55px)' top='45%'>
            No logs founded
          </Text>
        )}
      </Flex>
    </>
  )
}
