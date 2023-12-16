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

import React from 'react'
import { Image, Text, VStack } from '@chakra-ui/react'
import { locale } from 'src/i18n/i18n'

const Empty = () => {
  const lang = locale.get()
  return (
    <VStack spacing='16' py='16'>
      <Image src='/empty.svg' height='260px' />
      <Text fontSize='1.1rem'>
        {lang == 'zh'
          ? 'Moommm.. 看起来这里什么都没有'
          : 'Moommm..It seems there are nothing here ..'}
      </Text>
    </VStack>
  )
}

export default Empty
