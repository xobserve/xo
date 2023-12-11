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
  Button,
  Flex,
  HStack,
  Input,
  Text,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react'
import { ColorModeSwitcher } from 'src/components/ColorModeSwitcher'
import moment from 'moment'
import { Trace } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'
import { formatDuration } from 'utils/date'
import SpanGraph from './SpanGraph'
import { useEffect, useState } from 'react'
import {
  ETraceViewType,
  IViewRange,
  ViewRangeTimeUpdate,
} from '../../types/types'
import CollapseIcon from 'src/components/icons/Collapse'
import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai'
import IconButton from 'src/components/button/IconButton'
import RadionButtons from 'src/components/RadioButtons'
import { addParamToUrl } from 'utils/url'
import React from 'react'
import { dateTimeFormat } from 'utils/datetime/formatter'
import { MobileBreakpoint } from 'src/data/constants'
import { Select } from 'antd'
import { useSearchParam } from 'react-use'
import { Dashboard, Panel } from 'types/dashboard'
import { requestApi } from 'utils/axios/request'
import { isEmpty } from 'utils/validate'
import {
  commonInteractionEvent,
  genDynamicFunction,
} from 'utils/dashboard/dynamicCall'
import { cloneDeep, isFunction } from 'lodash'
import { getShortTraceId } from '../../utils/trace'
import { PanelType } from '../../../xobserveTrace/types'
import { initVariableSelected } from 'src/views/variables/SelectVariable'
import { $variables } from 'src/views/variables/store'
import CopyToClipboard from 'components/CopyToClipboard'
import { useNavigate } from 'react-router-dom'

interface Props {
  trace: Trace
  viewRange: IViewRange
  updateNextViewRangeTime: (update: ViewRangeTimeUpdate) => void
  updateViewRangeTime: any
  collapsed: boolean
  onGraphCollapsed: any
  searchCount: number
  prevResult: any
  nextResult: any
  viewType: string
  onViewTypeChange: any
  search: string
}

const detailTypes = [
  { label: 'Timeline', value: ETraceViewType.TraceTimelineViewer },
  { label: 'FlameGraph', value: ETraceViewType.TraceFlamegraph },
  { label: 'NodeGraph', value: ETraceViewType.TraceGraph },
  { label: 'Spans', value: ETraceViewType.TraceSpansView },
  { label: 'Statistics', value: ETraceViewType.TraceStatistics },
  { label: 'JSON', value: ETraceViewType.TraceJSON },
]

const TraceDetailHeader = ({
  trace,
  viewRange,
  updateNextViewRangeTime,
  updateViewRangeTime,
  collapsed,
  onGraphCollapsed,
  searchCount,
  prevResult,
  nextResult,
  viewType,
  onViewTypeChange,
  search,
}: Props) => {
  const dashboardId = useSearchParam('dashboardId')
  const panelId = useSearchParam('panelId')
  const [search1, setSearch] = useState(search)
  const [panel, setPanel] = useState<Panel>(null)
  const [onHover, setOnHover] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  useEffect(() => {
    if (dashboardId && panelId) {
      loadDashboard(dashboardId)
    }
  }, [])
  const loadDashboard = async (id) => {
    const res = await requestApi.get(`/dashboard/byId/${id}`)
    const dashboard: Dashboard = res.data
    const dashVars = cloneDeep(dashboard.data.variables)
    initVariableSelected(dashVars)
    $variables.set([...$variables.get(), ...dashVars])
    const p = dashboard.data.panels.find((p) => p.id.toString() == panelId)
    if (p) setPanel(p)
  }
  const onSearchChange = (v) => {
    setSearch(v)
    addParamToUrl({ search: v })
  }

  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
  const size = isLargeScreen ? 'sm' : 'sm'

  const interactionOptions =
    panel?.plugins.trace?.interaction ?? panel?.plugins[PanelType]?.interaction
  return (
    <>
      <Flex
        justifyContent='space-between'
        alignItems='center'
        p={isLargeScreen ? 1 : 0}
        onMouseEnter={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
      >
        <HStack>
          <CollapseIcon
            collapsed={collapsed}
            onClick={onGraphCollapsed}
            opacity='0.5'
            fontSize={size}
          />
          <Flex
            flexDir={isLargeScreen ? 'row' : 'column'}
            alignItems={isLargeScreen ? 'center' : 'start'}
            gap={isLargeScreen ? 2 : 0}
          >
            <Text fontSize={isLargeScreen ? size : 'xs'} noOfLines={1}>
              {trace.traceName}
            </Text>
            {isLargeScreen && (
              <Text textStyle='annotation'>
                {getShortTraceId(trace.traceID)}
              </Text>
            )}
            {onHover && (
              <CopyToClipboard
                copyText={trace.traceID}
                tooltipTitle='Copy traceId'
                fontSize='0.8rem'
              />
            )}
          </Flex>
        </HStack>
        <HStack spacing={2}>
          {panel && interactionOptions?.enable && (
            <HStack spacing={1}>
              {interactionOptions.actions.map((action, index) => {
                if (isEmpty(action.name)) {
                  return
                }
                const onClick = genDynamicFunction(action.action)
                return (
                  <Button
                    key={index + action.name}
                    colorScheme={action.color}
                    variant={action.style}
                    size={'sm'}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isFunction(onClick)) {
                        toast({
                          title: 'Error',
                          description:
                            'The action function you defined is not valid',
                          status: 'error',
                          duration: 4000,
                          isClosable: true,
                        })
                      } else {
                        commonInteractionEvent(onClick, trace, navigate)
                      }
                    }}
                  >
                    {action.name}
                  </Button>
                )
              })}
            </HStack>
          )}
          {viewType == ETraceViewType.TraceJSON ? (
            <Text fontSize={size} layerStyle='gradientText' mr='20px'>
              Click code area and Press Command+F to search{' '}
            </Text>
          ) : (
            viewType != ETraceViewType.TraceFlamegraph &&
            viewType != ETraceViewType.TraceSpansView && (
              <HStack spacing={0}>
                <HStack spacing={0} position='relative'>
                  <Input
                    width={isLargeScreen ? '240px' : '120px'}
                    size={size}
                    placeholder='Search..'
                    value={search1}
                    onChange={(e) => onSearchChange(e.currentTarget.value)}
                  />
                  <Text
                    textStyle='annotation'
                    width='30px'
                    position='absolute'
                    right='0'
                    mt='2px'
                  >
                    {searchCount}
                  </Text>
                </HStack>
                {viewType == ETraceViewType.TraceTimelineViewer && (
                  <>
                    <IconButton
                      size={size}
                      onClick={prevResult}
                      isDisabled={search == ''}
                      fontSize='1rem'
                    >
                      <AiOutlineUp />
                    </IconButton>
                    <IconButton
                      size={size}
                      onClick={nextResult}
                      isDisabled={search == ''}
                      fontSize='1rem'
                    >
                      <AiOutlineDown />
                    </IconButton>
                  </>
                )}
                {/* <Button size="sm" variant="outline" onClick={prevResult} isDisabled={search == ''}></Button> */}
              </HStack>
            )
          )}

          {isLargeScreen ? (
            <RadionButtons
              size='sm'
              theme='brand'
              fontSize='0.85rem'
              spacing={0}
              value={viewType}
              onChange={(v) => onViewTypeChange(v)}
              options={detailTypes}
            />
          ) : (
            <Select
              options={detailTypes}
              value={viewType}
              onChange={(v) => onViewTypeChange(v)}
            />
          )}
          {/* <ColorModeSwitcher miniMode fontSize={size} disableTrigger /> */}
        </HStack>
      </Flex>
      <HStack
        className='label-bg'
        px='2'
        py={isLargeScreen ? '4px' : '1px'}
        fontSize={isLargeScreen ? '0.9rem' : '0.9rem'}
        spacing={4}
      >
        <HStack>
          <Text opacity='0.8'>Start time</Text>
          <Text>{dateTimeFormat(trace.startTime / 1000)}</Text>
        </HStack>
        <HStack>
          <Text opacity='0.8'>Duration</Text>
          <Text>{formatDuration(trace.duration)}</Text>
        </HStack>
        <HStack>
          <Text opacity='0.8'>Services</Text>
          <Text>{trace.services.length}</Text>
        </HStack>
        <HStack>
          <Text opacity='0.8'>Depth</Text>
          <Text>{Math.max(...trace.spans.map((span) => span.depth)) + 1}</Text>
        </HStack>
        <HStack>
          <Text opacity='0.8'>Spans</Text>
          <Text>{trace.spans.length}</Text>
        </HStack>
        <HStack>
          <Text opacity='0.8'>Errors</Text>
          <Text>{trace.errorsCount}</Text>
        </HStack>
      </HStack>
      {!collapsed && (
        <SpanGraph
          trace={trace}
          viewRange={viewRange}
          updateNextViewRangeTime={updateNextViewRangeTime}
          updateViewRangeTime={updateViewRangeTime}
        />
      )}
    </>
  )
}

export default TraceDetailHeader
