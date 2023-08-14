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
import React, { useRef, useMemo, forwardRef } from 'react'


import classnames from 'classnames'

import { fade } from '@jiaminghi/color'

import { deepMerge } from '@jiaminghi/charts/lib/util'

import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import useAutoResize from '../autoResize'

import { uuid } from '../utils'

import { DecorationProps } from '../types'
import { Box } from '@chakra-ui/react'

const defaultColor = ['rgba(3, 166, 224, 0.8)', 'rgba(3, 166, 224, 0.5)']

const svgWH = [100, 100]

const Decoration9 = forwardRef(({ children, className, style, color = [], dur = 3 }:DecorationProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  const polygonIdRef = useRef(`decoration-9-polygon-${uuid()}`)

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const svgScale = useMemo(() => {
    const [w, h] = svgWH

    return [width / w, height / h]
  }, [width, height])

  const classNames = useMemo(() => classnames('dv-decoration-9 panel-decoration', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} ref={domRef} sx={cssStyles}>
      <svg
        width={`${svgWH[0]}px`}
        height={`${svgWH[1]}px`}
        style={{ transform: `scale(${svgScale[0]},${svgScale[1]})` }}
      >
        <defs>
          <polygon
            id={polygonIdRef.current}
            points='15, 46.5, 21, 47.5, 21, 52.5, 15, 53.5'
          />
        </defs>

        <circle
          cx='50'
          cy='50'
          r='45'
          fill='transparent'
          stroke={mergedColor[1]}
          strokeWidth='10'
          strokeDasharray='80, 100, 30, 100'
        >
          <animateTransform
            attributeName='transform'
            type='rotate'
            values='0 50 50;360 50 50'
            dur={`${dur}s`}
            repeatCount='indefinite'
          />
        </circle>

        <circle
          cx='50'
          cy='50'
          r='45'
          fill='transparent'
          stroke={mergedColor[0]}
          strokeWidth='6'
          strokeDasharray='50, 66, 100, 66'
        >
          <animateTransform
            attributeName='transform'
            type='rotate'
            values='0 50 50;-360 50 50'
            dur={`${dur}s`}
            repeatCount='indefinite'
          />
        </circle>

        <circle
          cx='50'
          cy='50'
          r='38'
          fill='transparent'
          stroke={fade(mergedColor[1] || defaultColor[1], 30)}
          strokeWidth='1'
          strokeDasharray='5, 1'
        />
        {new Array(20).fill(0).map((foo, i) => (
          <use
            key={i}
            href={`#${polygonIdRef.current}`}
            stroke={mergedColor[1]}
            fill={
              Math.random() > 0.4 ? 'transparent' : mergedColor[0]
            }
          >
            <animateTransform
              attributeName='transform'
              type='rotate'
              values='0 50 50;360 50 50'
              dur={`${dur}s`}
              begin={`${i * dur / 20}s`}
              repeatCount='indefinite'
            />
          </use>
        ))}

        <circle
          cx='50'
          cy='50'
          r='26'
          fill='transparent'
          stroke={fade(mergedColor[1] || defaultColor[1], 30)}
          strokeWidth='1'
          strokeDasharray='5, 1'
        />
      </svg>

      {children}
    </Box>
  )
})



export default Decoration9


const cssStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
  
    svg : {
      position: 'absolute',
      left: '0px',
      top: '0px',
      'transform-origin': 'left top',
    }
  }