// Copyright 2023 xObserve.io Team

import React, { useMemo } from 'react'

import classnames from 'classnames'

import { deepMerge } from '@jiaminghi/charts/lib/util'

import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'
import { DecorationProps } from '../types'
import { Box } from '@chakra-ui/react'

const defaultColor = ['#1dc1f5', '#1dc1f5']

const Decoration7 = ({
  children,
  className,
  style,
  color = [],
  margin,
}: DecorationProps) => {
  const mergedColor = useMemo(
    () => deepMerge(deepClone(defaultColor, true), color || []),
    [color],
  )

  const classNames = useMemo(
    () => classnames('dv-decoration-7 panel-decoration', className),
    [className],
  )

  return (
    <Box
      className={classNames}
      style={style}
      display='flex'
      width='100%'
      height='100%'
      justifyContent='center'
      alignItems='center'
    >
      <svg width='21px' height='20px' style={{ marginRight: margin }}>
        <polyline
          strokeWidth='4'
          fill='transparent'
          stroke={mergedColor[0]}
          points='10, 0 19, 10 10, 20'
        />
        <polyline
          strokeWidth='2'
          fill='transparent'
          stroke={mergedColor[1]}
          points='2, 0 11, 10 2, 20'
        />
      </svg>
      {children ?? <Box>aa</Box>}
      <svg width='21px' height='20px' style={{ marginLeft: margin }}>
        <polyline
          strokeWidth='4'
          fill='transparent'
          stroke={mergedColor[0]}
          points='11, 0 2, 10 11, 20'
        />
        <polyline
          strokeWidth='2'
          fill='transparent'
          stroke={mergedColor[1]}
          points='19, 0 10, 10 19, 20'
        />
      </svg>
    </Box>
  )
}

export default Decoration7
