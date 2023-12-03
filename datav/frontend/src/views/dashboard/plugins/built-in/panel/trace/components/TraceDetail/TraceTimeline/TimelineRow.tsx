// Copyright (c) 2017 Uber Technologies, Inc.
//

import { Box, useMediaQuery } from '@chakra-ui/react'
import * as React from 'react'
import './TimelineRow.css'
import { MobileBreakpoint } from 'src/data/constants'

type TTimelineRowProps = {
  children: React.ReactNode
  className?: string
}

interface ITimelineRowCellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  width: number
  style?: Object
}

export default function TimelineRow(props: TTimelineRowProps) {
  const { children, className = '', ...rest } = props
  return (
    <div
      className={`${className}`}
      style={{
        display: 'flex',
        flex: '0 1 auto',
        flexDirection: 'row',
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

TimelineRow.defaultProps = {
  className: '',
}

function TimelineRowCell(props: ITimelineRowCellProps) {
  const { children, className = '', width, style, ...rest } = props
  const widthPercent = `${width * 100}%`
  const mergedStyle = {
    ...style,
    flexBasis: widthPercent,
    maxWidth: widthPercent,
  }
  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
  return (
    <Box
      position='relative'
      className={`${className}`}
      style={mergedStyle}
      {...rest}
      fontSize={isLargeScreen ? '0.8rem' : '0.7rem'}
    >
      {children}
    </Box>
  )
}

TimelineRowCell.defaultProps = { className: '', style: {} }

TimelineRow.Cell = TimelineRowCell
