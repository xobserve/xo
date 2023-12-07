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

import React, { useMemo, forwardRef } from 'react'

import classnames from 'classnames'

import { deepMerge } from '@jiaminghi/charts/lib/util/index'
import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import useAutoResize from '../autoResize'

import { BorderBoxProps } from '../types'
import { Box } from '@chakra-ui/react'

const defaultColor = ['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.20)']

const BorderBox5 = forwardRef(
  (
    {
      children,
      reverse = false,
      className,
      style,
      color = [],
      backgroundColor = 'transparent',
    }: BorderBoxProps,
    ref,
  ) => {
    const { width, height, domRef } = useAutoResize(ref)

    const mergedColor = useMemo(
      () => deepMerge(deepClone(defaultColor, true), color || []),
      [color],
    )

    const classNames = useMemo(
      () => classnames('dv-border-box-5', className),
      [className],
    )

    return (
      <Box className={classNames} style={style} ref={domRef} sx={cssStyles}>
        <svg
          className={`dv-border-svg-container  ${reverse && 'dv-reverse'}`}
          width={width}
          height={height}
        >
          <polygon
            fill={backgroundColor}
            points={`
          10, 22 ${width - 22}, 22 ${width - 22}, ${height - 86} ${
              width - 84
            }, ${height - 24} 10, ${height - 24}
        `}
          />
          <polyline
            className='dv-bb5-line-1'
            stroke={mergedColor[0]}
            points={`8, 5 ${width - 5}, 5 ${width - 5}, ${height - 100}
          ${width - 100}, ${height - 5} 8, ${height - 5} 8, 5`}
          />
          <polyline
            className='dv-bb5-line-2'
            stroke={mergedColor[1]}
            points={`3, 5 ${width - 20}, 5 ${width - 20}, ${height - 60}
          ${width - 74}, ${height - 5} 3, ${height - 5} 3, 5`}
          />
          <polyline
            className='dv-bb5-line-3'
            stroke={mergedColor[1]}
            points={`50, 13 ${width - 35}, 13`}
          />
          <polyline
            className='dv-bb5-line-4'
            stroke={mergedColor[1]}
            points={`15, 20 ${width - 35}, 20`}
          />
          <polyline
            className='dv-bb5-line-5'
            stroke={mergedColor[1]}
            points={`15, ${height - 20} ${width - 110}, ${height - 20}`}
          />
          <polyline
            className='dv-bb5-line-6'
            stroke={mergedColor[1]}
            points={`15, ${height - 13} ${width - 110}, ${height - 13}`}
          />
        </svg>

        <div className='border-box-content'>{children}</div>
      </Box>
    )
  },
)

export default BorderBox5

const cssStyles = {
  position: 'relative',
  width: '100%',
  height: '100%',

  '.dv-reverse': {
    transform: 'rotate(180deg)',
  },

  '.dv-border-svg-container': {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100%',
    height: '100%',

    '& > polyline': {
      fill: 'none',
    },
  },

  '.dv-bb5-line-1, .dv-bb5-line-2': {
    'stroke-width': 1,
  },

  '.dv-bb5-line-3, .dv-bb5-line-6': {
    'stroke-width': 5,
  },

  '.dv-bb5-line-4, .dv-bb5-line-5': {
    'stroke-width': 2,
  },

  '.border-box-content': {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
}
