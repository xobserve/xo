// Copyright 2023 observex.io Team
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

const defaultColor = ['red', 'rgba(0,0,255,0.8)']

const BorderBox4 = forwardRef(({ children, reverse = false, className, style, color = [], backgroundColor = 'transparent' }: BorderBoxProps, ref) => {
    const { width, height, domRef } = useAutoResize(ref)

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

    const classNames = useMemo(() => classnames('dv-border-box-4', className), [
        className
    ])

    return (
        <Box className={classNames} style={style} ref={domRef} sx={cssStyles}>
            <svg
                className={`dv-border-svg-container ${reverse && 'dv-reverse'}`}
                width={width}
                height={height}
            >
                <polygon fill={backgroundColor} points={`
          ${width - 15}, 22 170, 22 150, 7 40, 7 28, 21 32, 24
          16, 42 16, ${height - 32} 41, ${height - 7} ${width - 15}, ${height - 7}
        `} />
                <polyline
                    className='dv-bb4-line-1'
                    stroke={mergedColor[0]}
                    points={`145, ${height - 5} 40, ${height - 5} 10, ${height - 35}
          10, 40 40, 5 150, 5 170, 20 ${width - 15}, 20`}
                />
                <polyline
                    className='dv-bb4-line-2'
                    stroke={mergedColor[1]}
                    points={`245, ${height - 1} 36, ${height - 1} 14, ${height - 23}
          14, ${height - 100}`}
                />
                <polyline
                    className='dv-bb4-line-3'
                    stroke={mergedColor[0]}
                    points={`7, ${height - 40} 7, ${height - 75}`}
                />
                <polyline className='dv-bb4-line-4' stroke={mergedColor[0]} points={`28, 24 13, 41 13, 64`} />
                <polyline className='dv-bb4-line-5' stroke={mergedColor[0]} points={`5, 45 5, 140`} />
                <polyline className='dv-bb4-line-6' stroke={mergedColor[1]} points={`14, 75 14, 180`} />
                <polyline
                    className='dv-bb4-line-7'
                    stroke={mergedColor[1]}
                    points={`55, 11 147, 11 167, 26 250, 26`}
                />
                <polyline className='dv-bb4-line-8' stroke={mergedColor[1]} points={`158, 5 173, 16`} />
                <polyline
                    className='dv-bb4-line-9'
                    stroke={mergedColor[0]}
                    points={`200, 17 ${width - 10}, 17`}
                />
                <polyline
                    className='dv-bb4-line-10'
                    stroke={mergedColor[1]}
                    points={`385, 17 ${width - 10}, 17`}
                />
            </svg>

            <div className='border-box-content'>{children}</div>
        </Box>
    )
})

export default BorderBox4

const cssStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',

    '.dv-reverse': {
        transform: 'rotate(180deg)',
    },

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

    '.sw1': {
        'stroke-width': 1
    },

    '.sw3': {
        'stroke-width': '3px',
        'stroke-linecap': 'round'
    },

    '.dv-bb4-line-1': {
        'stroke-width': 1
    },

    '.dv-bb4-line-2': {
        'stroke-width': 1
    },

    '.dv-bb4-line-3': {
        'stroke-width': '3px',
        'stroke-linecap': 'round'
    },

    '.dv-bb4-line-4': {
        'stroke-width': '3px',
        'stroke-linecap': 'round'
    },

    '.dv-bb4-line-5': {
        'stroke-width': 1
    },

    '.dv-bb4-line-6': {
        'stroke-width': 1
    },

    '.dv-bb4-line-7': {
        'stroke-width': 1
    },

    '.dv-bb4-line-8': {
        'stroke-width': '3px',
        'stroke-linecap': 'round'
    },

    '.dv-bb4-line-9': {
        'stroke-width': '3px',
        'stroke-linecap': 'round',
        'stroke-dasharray': '100 250'
    },

    '.dv-bb4-line-10': {
        'stroke-width': 1,
        'stroke-dasharray': '80 270'
    },

    '.border-box-content': {
        position: 'relative',
        width: '100%',
        height: '100%'
    }
}