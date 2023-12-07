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

import { Heading, Text, useColorModeValue, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import customColors from 'theme/colors'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

const Toc = ({ toc }) => {
  const [activeId, setActiveId] = useState(null)
  useIntersectionObserver('.markdown-render', setActiveId)

  return (
    <VStack
      spacing={0}
      alignItems='left'
      background={useColorModeValue(
        customColors.primaryColor.light,
        customColors.bodyBg.dark,
      )}
      maxH='100vh'
      overflowY='auto'
    >
      {toc.map((t) => {
        const level = Number(t.level)
        const id = t.content.toLowerCase().replace(/[?\s]/g, '-')
        return (
          <Heading
            py='2'
            px='2'
            className={activeId == id ? 'label-bg' : null}
            pl={15 * level + 'px'}
            fontSize='0.9rem'
            color={useColorModeValue(
              activeId == id ? 'inherit' : 'white',
              'brand.500',
            )}
            cursor='pointer'
            onClick={() => {
              const el = document.getElementById(id)
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }}
          >
            {t.content}
          </Heading>
        )
      })}
    </VStack>
  )
}

export default Toc
