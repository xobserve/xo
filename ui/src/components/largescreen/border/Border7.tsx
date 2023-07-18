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

const defaultColor = ['rgba(128,128,128,0.3)', 'rgba(128,128,128,0.5)']

const BorderBox7 = forwardRef(({ children, className, style, color = [], backgroundColor = 'transparent' }:BorderBoxProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const classNames = useMemo(() => classnames('dv-border-box-7', className), [
    className
  ])

  const styles = useMemo(() => ({
    boxShadow: `inset 0 0 40px ${mergedColor[0]}`,
    border: `1px solid ${mergedColor[0]}`,
    backgroundColor,
    ...style
  }), [style, mergedColor, backgroundColor])

  return (
    <Box className={classNames} style={styles} ref={domRef} sx={cssStyles}>
      <svg className='dv-border-svg-container' width={width} height={height}>
        <polyline className='dv-bb7-line-width-2' stroke={mergedColor[0]} points={`0, 25 0, 0 25, 0`} />
        <polyline
          className='dv-bb7-line-width-2'
          stroke={mergedColor[0]}
          points={`${width - 25}, 0 ${width}, 0 ${width}, 25`}
        />
        <polyline
          className='dv-bb7-line-width-2'
          stroke={mergedColor[0]}
          points={`${width -
            25}, ${height} ${width}, ${height} ${width}, ${height - 25}`}
        />
        <polyline
          className='dv-bb7-line-width-2'
          stroke={mergedColor[0]}
          points={`0, ${height - 25} 0, ${height} 25, ${height}`}
        />
        <polyline className='dv-bb7-line-width-5' stroke={mergedColor[1]} points={`0, 10 0, 0 10, 0`} />
        <polyline
          className='dv-bb7-line-width-5'
          stroke={mergedColor[1]}
          points={`${width - 10}, 0 ${width}, 0 ${width}, 10`}
        />
        <polyline
          className='dv-bb7-line-width-5'
          stroke={mergedColor[1]}
          points={`${width -
            10}, ${height} ${width}, ${height} ${width}, ${height - 10}`}
        />
        <polyline
          className='dv-bb7-line-width-5'
          stroke={mergedColor[1]}
          points={`0, ${height - 10} 0, ${height} 10, ${height}`}
        />
      </svg>

      <div className='border-box-content'>{children}</div>
    </Box>
  )
})


export default BorderBox7


const cssStyles =  {
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
        'stroke-linecap': 'round'
      }
    },
  
    '.dv-bb7-line-width-2': {
      'stroke-width': 2
    },

    '.dv-bb7-line-width-5': {
      'stroke-width': 5
    },
  
    '.border-box-content': {
      position: 'relative',
      width: '100%',
      height: '100%',
    }
  }