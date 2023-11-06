// Copyright 2023 xObserve.io Team
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

import { getPolylineLength, deepMerge } from '@jiaminghi/charts/lib/util'

import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import useAutoResize from '../autoResize'

import { DecorationProps } from '../types'
import { Box } from '@chakra-ui/react'

const defaultColor = ['#3f96a5', '#3f96a5']

const Decoration5 = forwardRef(({ className, dur = 1.2, style, color = [] }:DecorationProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  function calcSVGData() {
    let line1Points = [
      [0, height * 0.2],
      [width * 0.18, height * 0.2],
      [width * 0.2, height * 0.4],
      [width * 0.25, height * 0.4],
      [width * 0.27, height * 0.6],
      [width * 0.72, height * 0.6],
      [width * 0.75, height * 0.4],
      [width * 0.8, height * 0.4],
      [width * 0.82, height * 0.2],
      [width, height * 0.2]
    ] as any

    let line2Points = [[width * 0.3, height * 0.8], [width * 0.7, height * 0.8]] as any

    const line1Length = getPolylineLength(line1Points)
    const line2Length = getPolylineLength(line2Points)

    line1Points = line1Points.map(point => point.join(',')).join(' ')
    line2Points = line2Points.map(point => point.join(',')).join(' ')

    return { line1Points, line2Points, line1Length, line2Length }
  }

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const { line1Points, line2Points, line1Length, line2Length } = useMemo(
    calcSVGData,
    [width, height]
  )

  const classNames = useMemo(() => classnames('dv-decoration-5 panel-decoration', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} ref={domRef} width="100%" height="100%">
      <svg width={width} height={height}>
        <polyline
          fill='transparent'
          stroke={mergedColor[0]}
          strokeWidth='3'
          points={line1Points}
        >
          <animate
            attributeName='stroke-dasharray'
            attributeType='XML'
            from={`0, ${line1Length / 2}, 0, ${line1Length / 2}`}
            to={`0, 0, ${line1Length}, 0`}
            dur={`${dur}s`}
            begin='0s'
            calcMode='spline'
            keyTimes='0;1'
            keySplines='0.4,1,0.49,0.98'
            repeatCount='indefinite'
          />
        </polyline>
        <polyline
          fill='transparent'
          stroke={mergedColor[1]}
          strokeWidth='2'
          points={line2Points}
        >
          <animate
            attributeName='stroke-dasharray'
            attributeType='XML'
            from={`0, ${line2Length / 2}, 0, ${line2Length / 2}`}
            to={`0, 0, ${line2Length}, 0`}
            dur={`${dur}s`}
            begin='0s'
            calcMode='spline'
            keyTimes='0;1'
            keySplines='.4,1,.49,.98'
            repeatCount='indefinite'
          />
        </polyline>
      </svg>
    </Box>
  )
})


export default Decoration5