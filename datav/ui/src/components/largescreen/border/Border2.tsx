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

import { deepMerge } from '@jiaminghi/charts/lib/util/index'
import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import useAutoResize from '../autoResize'

import { BorderBoxProps } from '../types'
import { Box } from '@chakra-ui/react'

const defaultColor = ['#fff', 'rgba(255, 255, 255, 0.6)']

const BorderBox2 = forwardRef(({ children, className, style, color = [], backgroundColor = 'transparent' }: BorderBoxProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const classNames = useMemo(() => classnames('dv-border-box-2', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} ref={domRef} sx={cssStyles}>
      <svg className='dv-border-svg-container' width={width} height={height}>
        <polygon fill={backgroundColor} points={`
          7, 7 ${width - 7}, 7 ${width - 7}, ${height - 7} 7, ${height - 7}
        `} />
        <polyline
          stroke={mergedColor[0]}
          points={`2, 2 ${width - 2} ,2 ${width - 2}, ${height -
            2} 2, ${height - 2} 2, 2`}
        />
        <polyline
          stroke={mergedColor[1]}
          points={`6, 6 ${width - 6}, 6 ${width - 6}, ${height -
            6} 6, ${height - 6} 6, 6`}
        />
        <circle fill={mergedColor[0]} cx='11' cy='11' r='1' />
        <circle fill={mergedColor[0]} cx={width - 11} cy='11' r='1' />
        <circle fill={mergedColor[0]} cx={width - 11} cy={height - 11} r='1' />
        <circle fill={mergedColor[0]} cx='11' cy={height - 11} r='1' />
      </svg>
      <div className='border-box-content'>{children}</div>
    </Box>
  )
})


export default BorderBox2


const cssStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
  
    '.dv-border-svg-container': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: '0px',
      left: '0px',
  
      '& > polyline': {
        fill: 'none',
        'stroke-width': 1
      }
    },
  
    '.border-box-content': {
      position: 'relative',
      width: '100%',
      height: '100%'
    }
  }