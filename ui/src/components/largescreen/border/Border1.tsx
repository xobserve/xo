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
import { Box } from '@chakra-ui/react'
import { BorderBoxProps } from '../types'


const border = ['left-top', 'right-top', 'left-bottom', 'right-bottom']
const defaultColor = ['#4fd2dd', '#235fa7']



const BorderBox1 = forwardRef(({ children, className, style, color = [], backgroundColor = 'transparent' }: BorderBoxProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const classNames = useMemo(() => classnames('dv-border-box-1', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} ref={domRef} sx={cssStyles} >
      <svg className='border' width={width} height={height} >
        <polygon fill={backgroundColor} points={`10, 27 10, ${height - 27} 13, ${height - 24} 13, ${height - 21} 24, ${height - 11}
        38, ${height - 11} 41, ${height - 8} 73, ${height - 8} 75, ${height - 10} 81, ${height - 10}
        85, ${height - 6} ${width - 85}, ${height - 6} ${width - 81}, ${height - 10} ${width - 75}, ${height - 10}
        ${width - 73}, ${height - 8} ${width - 41}, ${height - 8} ${width - 38}, ${height - 11}
        ${width - 24}, ${height - 11} ${width - 13}, ${height - 21} ${width - 13}, ${height - 24}
        ${width - 10}, ${height - 27} ${width - 10}, 27 ${width - 13}, 25 ${width - 13}, 21
        ${width - 24}, 11 ${width - 38}, 11 ${width - 41}, 8 ${width - 73}, 8 ${width - 75}, 10
        ${width - 81}, 10 ${width - 85}, 6 85, 6 81, 10 75, 10 73, 8 41, 8 38, 11 24, 11 13, 21 13, 24`} />
      </svg>

      {border.map(borderName => (
        <svg
          width='150px'
          height='150px'
          key={borderName}
          className={`${borderName} border`}
          style={{zIndex: 1}}
        >
          <polygon
            fill={mergedColor[0]}
            points='6,66 6,18 12,12 18,12 24,6 27,6 30,9 36,9 39,6 84,6 81,9 75,9 73.2,7 40.8,7 37.8,10.2 24,10.2 12,21 12,24 9,27 9,51 7.8,54 7.8,63'
          >
            <animate
              attributeName='fill'
              values={`${mergedColor[0]};${mergedColor[1]};${mergedColor[0]}`}
              dur='0.5s'
              begin='0s'
              repeatCount='indefinite'
            />
          </polygon>
          <polygon
            fill={mergedColor[1]}
            points='27.599999999999998,4.8 38.4,4.8 35.4,7.8 30.599999999999998,7.8'
          >
            <animate
              attributeName='fill'
              values={`${mergedColor[1]};${mergedColor[0]};${mergedColor[1]}`}
              dur='0.5s'
              begin='0s'
              repeatCount='indefinite'
            />
          </polygon>
          <polygon
            fill={mergedColor[0]}
            points='9,54 9,63 7.199999999999999,66 7.199999999999999,75 7.8,78 7.8,110 8.4,110 8.4,66 9.6,66 9.6,54'
          >
            <animate
              attributeName='fill'
              values={`${mergedColor[0]};${mergedColor[1]};transparent`}
              dur='1s'
              begin='0s'
              repeatCount='indefinite'
            />
          </polygon>
        </svg>
      ))}

      <div className='border-box-content'>{children}</div>
    </Box>
  )
})

export default BorderBox1

const cssStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
  
    '.border' :{
      position: 'absolute',
      display: 'block',
    },
  
    '.right-top': {
      right: '0px',
      transform: 'rotateY(180deg)',
    },
  
    '.left-bottom': {
      bottom: '0px',
      transform: 'rotateX(180deg)',
    },
  
    '.right-bottom': {
      right: '0px',
      bottom: '0px',
      transform: 'rotateX(180deg) rotateY(180deg)',
    },
  
    '.border-box-content': {
      position: 'relative',
      width: '100%',
      height: '100%',
    }
  }