// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'

import { TNil } from '../../../types/misc'

import { formatDuration } from 'utils/date'
import { Box, useColorModeValue } from '@chakra-ui/react'
import customColors from 'src/theme/colors'

type TicksProps = {
  endTime?: number | TNil
  numTicks: number
  showLabels?: boolean | TNil
  startTime?: number | TNil
}

export default function Ticks(props: TicksProps) {
  const { endTime, numTicks, showLabels, startTime } = props

  let labels: undefined | string[]
  if (showLabels) {
    labels = []
    const viewingDuration = (endTime || 0) - (startTime || 0)
    for (let i = 0; i < numTicks; i++) {
      const durationAtTick =
        (startTime || 0) + (i / (numTicks - 1)) * viewingDuration
      labels.push(formatDuration(durationAtTick))
    }
  }
  const ticks: React.ReactNode[] = []
  for (let i = 0; i < numTicks; i++) {
    const portion = i / (numTicks - 1)
    ticks.push(
      <Box
        key={portion}
        className='Ticks--tick'
        style={{
          left: `${portion * 100}%`,
        }}
        position='absolute'
        height='100%'
        width='1px'
        bg={useColorModeValue(
          customColors.borderColor.light,
          customColors.borderColor.dark,
        )}
      >
        {labels && (
          <span
            className={`Ticks--tickLabel ${portion >= 1 ? 'isEndAnchor' : ''}`}
            style={{
              left: '0.25rem',
              position: 'absolute',
              whiteSpace: 'nowrap',
            }}
          >
            {labels[i]}
          </span>
        )}
      </Box>,
    )
  }
  return (
    <Box
      className='Ticks'
      pointerEvents='none'
      sx={{
        '.Ticks--tick:last-child': {
          width: 0,
        },
        '.Ticks--tickLabel.isEndAnchor': {
          left: 'initial',
          right: '0.25rem',
        },
      }}
    >
      {ticks}
    </Box>
  )
}

Ticks.defaultProps = {
  endTime: null,
  showLabels: null,
  startTime: null,
}
