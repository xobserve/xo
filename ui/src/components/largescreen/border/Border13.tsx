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


const defaultColor = ['#6586ec', '#2cf7fe']

const BorderBox13 = forwardRef(({ children, className, style, color = [], backgroundColor = 'transparent' }:BorderBoxProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const classNames = useMemo(() => classnames('dv-border-box-13', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} ref={domRef} sx={cssStyles}>
      <svg className='dv-border-svg-container' width={width} height={height} >
        <path
          fill={backgroundColor}
          stroke={mergedColor[0]}
          d={`
            M 5 20 L 5 10 L 12 3  L 60 3 L 68 10
            L ${width - 20} 10 L ${width - 5} 25
            L ${width - 5} ${height - 5} L 20 ${height - 5}
            L 5 ${height - 20} L 5 20
          `}
        />

        <path
          fill='transparent'
          strokeWidth='3'
          strokeLinecap='round'
          strokeDasharray='10, 5'
          stroke={mergedColor[0]}
          d='M 16 9 L 61 9'
        />

        <path
          fill='transparent'
          stroke={mergedColor[1]}
          d='M 5 20 L 5 10 L 12 3  L 60 3 L 68 10'
        />

        <path
          fill='transparent'
          stroke={mergedColor[1]}
          d={`M ${width - 5} ${height - 30} L ${width - 5} ${height - 5} L ${width - 30} ${height - 5}`}
        />
      </svg>
      <div className='border-box-content'>
        {children}
      </div>
    </Box>
  )
})


export default BorderBox13


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
    },
    
    '.border-box-content': {
      position: 'relative',
      width: '100%',
      height: '100%',
    }
  }