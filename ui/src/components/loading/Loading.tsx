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

import React, { useMemo } from 'react'


import classnames from 'classnames'
import { Box } from '@chakra-ui/react'


interface Props {
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
}
const Loading = ({ children, className, style }:Props) => {
  const classNames = useMemo(() => classnames('dv-loading', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} sx={cssStyles}>
      <svg width='50px' height='50px'>
        <circle
          cx='25'
          cy='25'
          r='15'
          fill='transparent'
          strokeWidth='2'
          strokeDasharray='31.415, 31.415'
          stroke='#02bcfe'
          strokeLinecap='round'
        >
          <animateTransform
            attributeName='transform'
            type='rotate'
            values='0, 25 25;360, 25 25'
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
          cx='25'
          cy='25'
          r='8'
          fill='transparent'
          strokeWidth='2'
          strokeDasharray='15.7, 15.7'
          stroke='#3be6cb'
          strokeLinecap='round'
        >
          <animateTransform
            attributeName='transform'
            type='rotate'
            values='360, 25 25;0, 25 25'
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
      'font-size': '15px'
    }
  }