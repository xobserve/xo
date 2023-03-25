import React, { useMemo, forwardRef } from 'react'


import classnames from 'classnames'

import { deepMerge } from '@jiaminghi/charts/lib/util'

import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import useAutoResize from '../autoResize'

import { DecorationProps } from '../types'
import { Box } from '@chakra-ui/react'

const defaultColor = ['#3f96a5', '#3f96a5']

const Decoration8 = forwardRef(({ reverse = false, className, style, color = [] }:DecorationProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  const xPos = pos => (!reverse ? pos : width - pos)

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const [pointsOne, pointsTwo, pointsThree] = useMemo(
    () => [
      `${xPos(0)}, 0 ${xPos(30)}, ${height / 2}`,
      `${xPos(20)}, 0 ${xPos(50)}, ${height / 2} ${xPos(width)}, ${height / 2}`,
      `${xPos(0)}, ${height - 3}, ${xPos(200)}, ${height - 3}`
    ],
    [reverse, width, height]
  )

  const classNames = useMemo(() => classnames('dv-decoration-8', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} ref={domRef} display="flex" width="100%" height="100%">
      <svg width={width} height={height}>
        <polyline
          stroke={mergedColor[0]}
          strokeWidth='2'
          fill='transparent'
          points={pointsOne}
        />

        <polyline
          stroke={mergedColor[0]}
          strokeWidth='2'
          fill='transparent'
          points={pointsTwo}
        />

        <polyline
          stroke={mergedColor[1]}
          fill='transparent'
          strokeWidth='3'
          points={pointsThree}
        />
      </svg>
    </Box>
  )
})


export default Decoration8