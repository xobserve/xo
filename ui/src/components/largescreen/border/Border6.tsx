// Copyright 2023 Datav.io Team
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

const defaultColor = ['rgba(255, 255, 255, 0.35)', 'gray']

const BorderBox6 = forwardRef(({ children, className, style, color = [], backgroundColor = 'transparent' }:BorderBoxProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const classNames = useMemo(() => classnames('dv-border-box-6', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} ref={domRef} sx={cssStyles}>
      <svg className='dv-border-svg-container' width={width} height={height} style={{zIndex: 1}}>
        <polygon fill={backgroundColor} points={`
          9, 7 ${width - 9}, 7 ${width - 9}, ${height - 7} 9, ${height - 7}
        `} />
        <circle fill={mergedColor[1]} cx='5' cy='5' r='2' />
        <circle fill={mergedColor[1]} cx={width - 5} cy='5' r='2' />
        <circle fill={mergedColor[1]} cx={width - 5} cy={height - 5} r='2' />
        <circle fill={mergedColor[1]} cx='5' cy={height - 5} r='2' />
        <polyline stroke={mergedColor[0]} points={`10, 4 ${width - 10}, 4`} />
        <polyline stroke={mergedColor[0]} points={`10, ${height - 4} ${width - 10}, ${height - 4}`} />
        <polyline stroke={mergedColor[0]} points={`5, 70 5, ${height - 70}`} />
        <polyline stroke={mergedColor[0]} points={`${width - 5}, 70 ${width - 5}, ${height - 70}`} />
        <polyline stroke={mergedColor[0]} points={`3, 10, 3, 50`} />
        <polyline stroke={mergedColor[0]} points={`7, 30 7, 80`} />
        <polyline stroke={mergedColor[0]} points={`${width - 3}, 10 ${width - 3}, 50`} />
        <polyline stroke={mergedColor[0]} points={`${width - 7}, 30 ${width - 7}, 80`} />
        <polyline stroke={mergedColor[0]} points={`3, ${height - 10} 3, ${height - 50}`} />
        <polyline stroke={mergedColor[0]} points={`7, ${height - 30} 7, ${height - 80}`} />
        <polyline
          stroke={mergedColor[0]}
          points={`${width - 3}, ${height - 10} ${width - 3}, ${height - 50}`}
        />
        <polyline
          stroke={mergedColor[0]}
          points={`${width - 7}, ${height - 30} ${width - 7}, ${height - 80}`}
        />
      </svg>

      <div className='border-box-content'>{children}</div>
    </Box>
  )
})


export default BorderBox6

const cssStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
  
    '.dv-border-svg-container': {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
  
      '& > polyline': {
        fill: 'none',
        'stroke-width': 1,
      }
    },
  
    '.border-box-content': {
      position: 'relative',
      width: '100%',
      height: '100%'
    }
  }