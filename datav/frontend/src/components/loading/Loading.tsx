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

import React, { useMemo } from 'react'

import classnames from 'classnames'
import { Box } from '@chakra-ui/react'

interface Props {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  size?: 'xs' | 'sm' | 'md'
}
const Loading = ({ children, className, style, size = 'md' }: Props) => {
  const classNames = useMemo(
    () => classnames('dv-loading', className),
    [className],
  )

  const radius = size == 'sm' ? '15' : '25'
  return (
    <Box className={classNames} style={style} sx={cssStyles}>
      <svg
        width={size == 'sm' ? '25px' : '50px'}
        height={size == 'sm' ? '25px' : '50px'}
      >
        <circle
          cx={radius}
          cy={radius}
          r={size == 'sm' ? '6' : '10'}
          fill='transparent'
          strokeWidth={size == 'sm' ? '1' : '2'}
          strokeDasharray='31.415, 31.415'
          stroke='#02bcfe'
          strokeLinecap='round'
        >
          <animateTransform
            attributeName='transform'
            type='rotate'
            values={`0, ${radius} ${radius};360, ${radius} ${radius}`}
            dur='1.5s'
            repeatCount='indefinite'
          />
          <animate
            attributeName='stroke'
            values='#02bcfe;#3be6cb;#02bcfe'
            dur='3s'
            repeatCount='indefinite'
          />
        </circle>

        <circle
          cx={radius}
          cy={radius}
          r={size == 'sm' ? '4' : '8'}
          fill='transparent'
          strokeWidth={size == 'sm' ? '1' : '2'}
          strokeDasharray='15.7, 15.7'
          stroke='#3be6cb'
          strokeLinecap='round'
        >
          <animateTransform
            attributeName='transform'
            type='rotate'
            values={`360, ${radius} ${radius};0, ${radius} ${radius}`}
            dur='1.5s'
            repeatCount='indefinite'
          />
          <animate
            attributeName='stroke'
            values='#3be6cb;#02bcfe;#3be6cb'
            dur='3s'
            repeatCount='indefinite'
          />
        </circle>
      </svg>
      <div className='loading-tip'>{children}</div>
    </Box>
  )
}

export default Loading

const cssStyles = {
  width: '100%',
  height: '100%',
  display: 'flex',
  'flex-direction': 'column',
  'justify-content': 'center',
  'align-items': 'center',

  '.loading-tip': {
    'font-size': '15px',
  },
}
