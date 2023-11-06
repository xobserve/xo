// Copyright 2023 observex.io Team
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

  const classNames = useMemo(() => classnames('dv-decoration-8 panel-decoration', className), [
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