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
import React, { useState, useMemo, forwardRef } from 'react'


import classnames from 'classnames'

import { deepMerge } from '@jiaminghi/charts/lib/util/index'
import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import useAutoResize from '../autoResize'

import { uuid } from '../utils'
import { BorderBoxProps } from '../types'
import { Box } from '@chakra-ui/react'


const defaultColor = ['#11eefd', '#0078d2']

const BorderBox9 = forwardRef(({ children, className, style, color = [], backgroundColor = 'transparent' }:BorderBoxProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  const [{ gradientId, maskId }] = useState(() => {
    const id = uuid()

    return {
      gradientId: `border-box-9-gradient-${id}`,
      maskId: `border-box-9-mask-${id}`
    }
  })

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const classNames = useMemo(() => classnames('dv-border-box-9', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} ref={domRef} sx={cssStyles}>
      <svg className='dv-border-svg-container' width={width} height={height}>
        <defs>
          <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='100%'>
            <animate
              attributeName='x1'
              values='0%;100%;0%'
              dur='10s'
              begin='0s'
              repeatCount='indefinite'
            />
            <animate
              attributeName='x2'
              values='100%;0%;100%'
              dur='10s'
              begin='0s'
              repeatCount='indefinite'
            />
            <stop offset='0%' stopColor={mergedColor[0]}>
              <animate
                attributeName='stop-color'
                values={`${mergedColor[0]};${mergedColor[1]};${mergedColor[0]}`}
                dur='10s'
                begin='0s'
                repeatCount='indefinite'
              />
            </stop>
            <stop offset='100%' stopColor={mergedColor[1]}>
              <animate
                attributeName='stop-color'
                values={`${mergedColor[1]};${mergedColor[0]};${mergedColor[1]}`}
                dur='10s'
                begin='0s'
                repeatCount='indefinite'
              />
            </stop>
          </linearGradient>

          <mask id={maskId}>
            <polyline
              stroke='#fff'
              strokeWidth='3'
              fill='transparent'
              points={`8, ${height * 0.4} 8, 3, ${width * 0.4 + 7}, 3`}
            />
            <polyline
              fill='#fff'
              points={`8, ${height * 0.15} 8, 3, ${width * 0.1 + 7}, 3
                ${width * 0.1}, 8 14, 8 14, ${height * 0.15 - 7}
              `}
            />

            <polyline
              stroke='#fff'
              strokeWidth='3'
              fill='transparent'
              points={`${width * 0.5}, 3 ${width - 3}, 3, ${width -
                3}, ${height * 0.25}`}
            />
            <polyline
              fill='#fff'
              points={`
                ${width * 0.52}, 3 ${width * 0.58}, 3
                ${width * 0.58 - 7}, 9 ${width * 0.52 + 7}, 9
              `}
            />
            <polyline
              fill='#fff'
              points={`
                ${width * 0.9}, 3 ${width - 3}, 3 ${width - 3}, ${height * 0.1}
                ${width - 9}, ${height * 0.1 - 7} ${width - 9}, 9 ${width *
                0.9 +
                7}, 9
              `}
            />

            <polyline
              stroke='#fff'
              strokeWidth='3'
              fill='transparent'
              points={`8, ${height * 0.5} 8, ${height - 3} ${width * 0.3 +
                7}, ${height - 3}`}
            />
            <polyline
              fill='#fff'
              points={`
                8, ${height * 0.55} 8, ${height * 0.7}
                2, ${height * 0.7 - 7} 2, ${height * 0.55 + 7}
              `}
            />

            <polyline
              stroke='#fff'
              strokeWidth='3'
              fill='transparent'
              points={`${width * 0.35}, ${height - 3} ${width - 3}, ${height -
                3} ${width - 3}, ${height * 0.35}`}
            />
            <polyline
              fill='#fff'
              points={`
                ${width * 0.92}, ${height - 3} ${width - 3}, ${height -
                3} ${width - 3}, ${height * 0.8}
                ${width - 9}, ${height * 0.8 + 7} ${width - 9}, ${height -
                9} ${width * 0.92 + 7}, ${height - 9}
              `}
            />
          </mask>
        </defs>

        <polygon fill={backgroundColor} points={`
          15, 9 ${width * 0.1 + 1}, 9 ${width * 0.1 + 4}, 6 ${width * 0.52 + 2}, 6
          ${width * 0.52 + 6}, 10 ${width * 0.58 - 7}, 10 ${width * 0.58 - 2}, 6
          ${width * 0.9 + 2}, 6 ${width * 0.9 + 6}, 10 ${width - 10}, 10 ${width - 10}, ${height * 0.1 - 6}
          ${width - 6}, ${height * 0.1 - 1} ${width - 6}, ${height * 0.8 + 1} ${width - 10}, ${height * 0.8 + 6}
          ${width - 10}, ${height - 10} ${width * 0.92 + 7}, ${height - 10}  ${width * 0.92 + 2}, ${height - 6}
          11, ${height - 6} 11, ${height * 0.15 - 2} 15, ${height * 0.15 - 7}
        `} />

        <rect
          x='0'
          y='0'
          width={width}
          height={height}
          fill={`url(#${gradientId})`}
          mask={`url(#${maskId})`}
        />
      </svg>

      <div className='border-box-content'>{children}</div>
    </Box>
  )
})


export default BorderBox9


const cssStyles =  {
    position: 'relative',
    width: '100%',
    height: '100%',
  
    '.dv-border-svg-container': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: '0px',
      top: '0px'
    },
  
    '.border-box-content': {
      position: 'relative',
      width: '100%',
      height: '100%'
    }
  }