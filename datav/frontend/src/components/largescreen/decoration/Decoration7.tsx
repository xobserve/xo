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
