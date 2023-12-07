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

import {
  Box,
  HStack,
  HTMLChakraProps,
  Image,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import React from 'react'

const Logo = ({ showText = false, width = 12 }) => {
  return (
    <HStack cursor='pointer' spacing='1'>
      <Image
        width={width}
        src='/logo.svg'
        // animation='spin 30s linear infinite'
      />
      {showText && (
        <Text fontWeight='600' fontSize='xl'>
          xobserve
        </Text>
      )}
    </HStack>
  )
}

export default Logo

export const LogoIcon = (props: HTMLChakraProps<'svg'>) => {
  const fill = useColorModeValue('#151618', '#fff')
  return (
    <a href='/'>
      <Box cursor='pointer'>
        <svg
          height='20'
          viewBox='0 0 114 20'
          width='114'
          xmlns='http://www.w3.org/2000/svg'
        >
          \
          <g fill={fill} fillRule='evenodd' id='svg_1'>
            <g fillRule='nonzero' id='svg_2'>
              <path
                d='M30.6276,9.99306L26.69038,6.0476L28.65797,2.10352L35.05517,8.51411C35.87026,9.33091 35.87026,10.65521 35.05517,11.472L27.18143,19.36223C26.36633,20.17903 25.04481,20.17903 24.22971,19.36223C23.41462,18.54543 23.41462,17.22114 24.22971,16.40434L30.6276,9.99306z'
                opacity='.56'
                id='svg_3'
              ></path>
              <path
                d='M24.23118,0.61615C25.04627,-0.20065 26.36814,-0.20031 27.18323,0.61649L28.65943,2.09578L11.43678,19.3545C10.62168,20.1713 9.29981,20.17096 8.48472,19.35416L7.00852,17.87487L24.23118,0.61615zM16.84984,6.04055L13.89745,8.99913L9.96023,5.05368L5.03889,9.98533L8.9761,13.93078L7.00852,17.87487L0.61132,11.46427C-0.20377,10.64747 -0.20377,9.32318 0.61132,8.50638L8.48472,0.61649C9.29981,-0.20031 10.62168,-0.20065 11.43678,0.61615L16.84984,6.04055z'
                id='svg_4'
              ></path>
            </g>
          </g>
        </svg>
      </Box>
    </a>
  )
}
