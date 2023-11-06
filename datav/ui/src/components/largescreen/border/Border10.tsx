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


const border = ['left-top', 'right-top', 'left-bottom', 'right-bottom']
const defaultColor = ['#1d48c4', '#d3e1f8']

const BorderBox10 = forwardRef(({ children, className, style, color = [], backgroundColor = 'transparent' }: BorderBoxProps, ref) => {
    const { width, height, domRef } = useAutoResize(ref)

    const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

    const classNames = useMemo(() => classnames('dv-border-box-10', className), [
        className
    ])

    const styles = useMemo(() => ({
        boxShadow: `inset 0 0 25px 3px ${mergedColor[0]}`,
        ...style
    }), [style, mergedColor])

    return (
        <Box className={classNames} style={styles} ref={domRef} sx={cssStyles}>
            <svg className='dv-border-svg-container' width={width} height={height}>
                <polygon fill={backgroundColor} points={`
          4, 0 ${width - 4}, 0 ${width}, 4 ${width}, ${height - 4} ${width - 4}, ${height}
          4, ${height} 0, ${height - 4} 0, 4
        `} />
            </svg>

            {border.map(borderName => (
                <svg
                    width='150px'
                    height='150px'
                    key={borderName}
                    className={`${borderName} dv-border-svg-container`}
                >
                    <polygon
                        fill={mergedColor[1]}
                        points='40, 0 5, 0 0, 5 0, 16 3, 19 3, 7 7, 3 35, 3'
                    />
                </svg>
            ))}
            <div className='border-box-content'>{children}</div>
        </Box>
    )
})


export default BorderBox10

const cssStyles = {
    position: 'relative',
    width: "100%",
    height: '100%',
    'border-radius': '6px',

    '.dv-border-svg-container': {
        position: 'absolute',
        display: 'block'
    },

    '.right-top': {
        right: '0px',
        transform: 'rotateY(180deg)'
    },

    '.left-bottom': {
        bottom: '0px',
        transform: 'rotateX(180deg)'
    },

    '.right-bottom': {
        right: '0px',
        bottom: '0px',
        transform: 'rotateX(180deg) rotateY(180deg)'
    },

    '.border-box-content': {
        position: 'relative',
        width: '100%',
        height: "100%"
    }
}