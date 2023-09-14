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

const defaultColor = ['#2862b7', '#2862b7']

const BorderBox3 = forwardRef(({ children, className, style, color = [], backgroundColor = 'transparent' }: BorderBoxProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const classNames = useMemo(() => classnames('dv-border-box-3', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} ref={domRef} sx={cssStyles}>
      <svg className='dv-border-svg-container' width={width} height={height}>
        <polygon fill={backgroundColor} points={`
          23, 23 ${width - 24}, 23 ${width - 24}, ${height - 24} 23, ${height - 24}
        `} />
        <polyline
          className='dv-bb3-line1'
          stroke={mergedColor[0]}
          points={`4, 4 ${width - 22} ,4 ${width - 22}, ${height -
            22} 4, ${height - 22} 4, 4`}
        />
        <polyline
          className='dv-bb3-line2'
          stroke={mergedColor[1]}
          points={`10, 10 ${width - 16}, 10 ${width - 16}, ${height -
            16} 10, ${height - 16} 10, 10`}
        />
        <polyline
          className='dv-bb3-line2'
          stroke={mergedColor[1]}
          points={`16, 16 ${width - 10}, 16 ${width - 10}, ${height -
            10} 16, ${height - 10} 16, 16`}
        />
        <polyline
          className='dv-bb3-line2'
          stroke={mergedColor[1]}
          points={`22, 22 ${width - 4}, 22 ${width - 4}, ${height -
            4} 22, ${height - 4} 22, 22`}
        />
      </svg>

      <div className='border-box-content'>{children}</div>
    </Box>
  )
})


export default BorderBox3

const cssStyles =  {
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
        fill: 'none'
      }
    },
  
    '.dv-bb3-line1': {
      'stroke-width': 3
    },
  
    '.dv-bb3-line2': {
      'stroke-width': 1,
    },
  
    '.border-box-content': {
      position: 'relative',
      width: '100%',
      height: '100%',
    }
  }