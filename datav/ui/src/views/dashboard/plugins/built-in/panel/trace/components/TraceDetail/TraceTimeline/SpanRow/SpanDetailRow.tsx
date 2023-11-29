// Copyright (c) 2017 Uber Technologies, Inc.
//

import React from 'react'
import './SpanDetailRow.css'
import SpanDetail from './SpanDetail/index'
import DetailState from './SpanDetail/DetailState'
import SpanTreeOffset from './SpanTreeOffset'
import TimelineRow from '../TimelineRow'

import {
  SpanLog,
  TraceSpan,
  KeyValuePair,
  SpanLink,
} from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'
import { Box, useColorMode, useColorModeValue } from '@chakra-ui/react'
import customColors from 'src/theme/colors'

type SpanDetailRowProps = {
  color: string
  columnDivision: number
  detailState: DetailState
  onDetailToggled: (spanID: string) => void
  linksGetter: (
    span: TraceSpan,
    links: KeyValuePair[],
    index: number,
  ) => SpanLink[]
  logItemToggle: (spanID: string, log: SpanLog) => void
  logsToggle: (spanID: string) => void
  processToggle: (spanID: string) => void
  referencesToggle: (spanID: string) => void
  warningsToggle: (spanID: string) => void
  span: TraceSpan
  tagsToggle: (spanID: string) => void
  traceStartTime: number
  focusSpan: (uiFind: string) => void
  hoverIndentIds: Set<string>
  addHoverIndentId: (spanID: string) => void
  removeHoverIndentId: (spanID: string) => void
}

const SpanDetailRow = (props: SpanDetailRowProps) => {
  const { colorMode } = useColorMode()
  const _detailToggle = () => {
    props.onDetailToggled(props.span.spanID)
  }

  const _linksGetter = (items: KeyValuePair[], itemIndex: number) => {
    const { linksGetter, span } = props
    return linksGetter(span, items, itemIndex)
  }

  const {
    color,
    columnDivision,
    detailState,
    logItemToggle,
    logsToggle,
    processToggle,
    referencesToggle,
    warningsToggle,
    span,
    tagsToggle,
    traceStartTime,
    focusSpan,
    hoverIndentIds,
    addHoverIndentId,
    removeHoverIndentId,
  } = props
  return (
    <TimelineRow className='detail-row'>
      <TimelineRow.Cell width={columnDivision}>
        <SpanTreeOffset
          span={span}
          showChildrenIcon={false}
          hoverIndentIds={hoverIndentIds}
          addHoverIndentId={addHoverIndentId}
          removeHoverIndentId={removeHoverIndentId}
        />
        <span>
          <span
            className='detail-row-expanded-accent'
            aria-checked='true'
            onClick={_detailToggle}
            role='switch'
            style={{ borderColor: color }}
          />
        </span>
      </TimelineRow.Cell>
      <TimelineRow.Cell width={1 - columnDivision}>
        <Box
          sx={{
            '.detail-info-wrapper': {
              background: useColorModeValue('#fff', customColors.bodyBg.dark),
              border: colorMode == 'light' ? '1px solid #d3d3d3' : null,
              borderTop: '3px solid',
              padding: '0.75rem',
            },
          }}
        >
          <div
            className='detail-info-wrapper'
            style={{ borderTopColor: color }}
          >
            <SpanDetail
              detailState={detailState}
              linksGetter={_linksGetter}
              logItemToggle={logItemToggle}
              logsToggle={logsToggle}
              processToggle={processToggle}
              referencesToggle={referencesToggle}
              warningsToggle={warningsToggle}
              span={span}
              tagsToggle={tagsToggle}
              traceStartTime={traceStartTime}
              focusSpan={focusSpan}
            />
          </div>
        </Box>
      </TimelineRow.Cell>
    </TimelineRow>
  )
}

export default SpanDetailRow
