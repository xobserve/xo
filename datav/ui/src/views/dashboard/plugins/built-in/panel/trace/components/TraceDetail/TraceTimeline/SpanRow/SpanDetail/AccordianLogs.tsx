// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'
import cx from 'classnames'
import _sortBy from 'lodash/sortBy'
import './AccordianLogs.css'
import AccordianKeyValues from './AccordianKeyValues'
import { TNil } from 'types/misc'
import {
  SpanLog,
  KeyValuePair,
  SpanLink,
} from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'

import { formatDuration } from 'utils/date'
import { AiOutlineDown, AiOutlineRight } from 'react-icons/ai'
import { Box, VStack } from '@chakra-ui/react'

type AccordianLogsProps = {
  interactive?: boolean
  isOpen: boolean
  linksGetter: ((pairs: KeyValuePair[], index: number) => SpanLink[]) | TNil
  logs: SpanLog[]
  onItemToggle?: (log: SpanLog) => void
  onToggle?: () => void
  openedItems?: Set<SpanLog>
  timestamp: number
}

export default function AccordianLogs(props: AccordianLogsProps) {
  const {
    interactive,
    isOpen,
    linksGetter,
    logs,
    openedItems,
    onItemToggle,
    onToggle,
    timestamp,
  } = props
  let arrow: React.ReactNode | null = null
  let HeaderComponent: 'span' | 'a' = 'span'
  let headerProps: Object | null = null
  if (interactive) {
    arrow = isOpen ? (
      <AiOutlineDown opacity='0.6' className='u-align-icon' />
    ) : (
      <AiOutlineRight opacity='0.6' className='u-align-icon' />
    )
    HeaderComponent = 'a'
    headerProps = {
      'aria-checked': isOpen,
      onClick: onToggle,
      role: 'switch',
    }
  }

  return (
    <Box
      className='AccordianLogs'
      sx={{
        '.AccordianLogs--header svg': {
          display: 'inline-block !important',
          marginBottom: '-2px',
          marginRight: '5px',
        },
      }}
    >
      <HeaderComponent
        className={cx('AccordianLogs--header', { 'is-open': isOpen })}
        {...headerProps}
      >
        {arrow} <strong style={{ marginLeft: '-2px' }}>Events</strong> (
        {logs?.length})
      </HeaderComponent>
      {isOpen && (
        <VStack
          alignItems='left'
          spacing={1}
          className='AccordianLogs--content bordered-top'
        >
          {_sortBy(logs, 'timestamp').map((log, i) => (
            <AccordianKeyValues
              // `i` is necessary in the key because timestamps can repeat
              // eslint-disable-next-line react/no-array-index-key
              key={`${log.timestamp}-${i}`}
              className={i < logs.length - 1 ? 'ub-mb1' : null}
              data={log.fields || []}
              highContrast
              interactive={interactive}
              isOpen={openedItems ? openedItems.has(log) : false}
              label={`${formatDuration(log.timestamp - timestamp)}`}
              linksGetter={linksGetter}
              onToggle={
                interactive && onItemToggle ? () => onItemToggle(log) : null
              }
            />
          ))}
          <small className='AccordianLogs--footer'>
            Event timestamps are relative to the start time of the full trace.
          </small>
        </VStack>
      )}
    </Box>
  )
}

AccordianLogs.defaultProps = {
  interactive: true,
  linksGetter: undefined,
  onItemToggle: undefined,
  onToggle: undefined,
  openedItems: undefined,
}
