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
import { DecorationProps } from '../types'
import { Box } from '@chakra-ui/react'


const defaultColor = ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.3)']


const Decoration4 = forwardRef(({ reverse = false, dur = 3, className, style, color = [] }: DecorationProps, ref) => {
    const { width, height, domRef } = useAutoResize(ref)

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

    const classNames = useMemo(() => classnames('dv-decoration-4 panel-decoration', className), [
        className
    ])

    return (
        <Box sx={cssStyles}>
            <Box className={classNames} style={style} ref={domRef}>
                <div
                    className={`container ${reverse ? 'reverse' : 'normal'}`}
                    style={
                        reverse
                            ? { width: `${width}px`, height: `5px`, animationDuration: `${dur}s` }
                            : { width: `5px`, height: `${height}px`, animationDuration: `${dur}s` }
                    }
                >
                    <svg width={reverse ? width : 5} height={reverse ? 5 : height}>
                        <polyline
                            stroke={mergedColor[0]}
                            points={reverse ? `0, 2.5 ${width}, 2.5` : `2.5, 0 2.5, ${height}`}
                        />
                        <polyline
                            className='bold-line'
                            stroke={mergedColor[1]}
                            strokeWidth='3'
                            strokeDasharray='20, 80'
                            strokeDashoffset='-30'
                            points={reverse ? `0, 2.5 ${width}, 2.5` : `2.5, 0 2.5, ${height}`}
                        />
                    </svg>
                </div>
            </Box>
        </Box >
    )
})


export default Decoration4

const cssStyles = {
    '.dv-decoration-4': {
        'position': 'relative',
        width: '100%',
        height: '100%',
        '.container': {
            display: 'flex',
            overflow: 'hidden',
            position: 'absolute',
            flex: 1
        },
        '.normal': {
            animation: 'ani-height ease-in-out infinite',
            left: '50%',
            'margin-left': '-2px'
        },
        '.reverse': {
            animation: 'ani-width ease-in-out infinite',
            top: '50%',
            'margin-top': '-2px'
        },



        '@keyframes ani-height': {
            '0%': {
                height: '0%',
            },

            '70%': {
                height: '100%',
            },

            '100%': {
                height: '100%'
            }
        },

        '@keyframes ani-width': {
            '0%': {
                width: '0%'
            },

            '70%': {
                width: "100%"
            },

            '100%': {
                width: "100%"
            },
        }
    }
}