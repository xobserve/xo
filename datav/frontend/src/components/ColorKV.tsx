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

import { Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'

const ColorKV = ({ k, v, renderString = true, colorK = true }) => {
  const isString = typeof v == 'string'
  return (
    <>
      <Text color={colorK && 'rgb(131, 120, 255)'} minW='fit-content'>
        {k}
      </Text>
      <Text
        color={
          isString
            ? useColorModeValue('rgb(0, 166, 0)', 'rgb(166, 226, 46)')
            : useColorModeValue('rgb(253, 130, 31)', 'rgb(253, 151, 31)')
        }
      >
        {renderString && isString ? `"${v}"` : v}
      </Text>
    </>
  )
}

export default ColorKV
