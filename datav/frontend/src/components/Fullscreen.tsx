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

import { Box, Tooltip, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { FaTv } from 'react-icons/fa'
import { useKey, useSearchParam } from 'react-use'
import React from 'react'
import { useStore } from '@nanostores/react'
import { dashboardMsg } from 'src/i18n/locales/en'
import { addParamToUrl, removeParamFromUrl } from 'utils/url'
import useEmbed from 'hooks/useEmbed'

const Fullscreen = () => {
  const t1 = useStore(dashboardMsg)
  const toast = useToast()
  const fullscreenParam = useSearchParam('fullscreen')
  const [fullscreen, setFullscreen] = useState(
    fullscreenParam == 'on' ? true : false,
  )
  const embed = useEmbed()
  useKey('Escape', () => {
    !embed && onFullscreenChange(true)
  })

  const onFullscreenChange = (isExit?) => {
    setFullscreen((f) => {
      if (isExit) {
        f && removeParamFromUrl(['fullscreen'])
        return false
      }

      if (!f) {
        toast({
          description: t1.exitFullscreenTips,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
      addParamToUrl({ fullscreen: 'on' })
      return !f
    })
  }

  return (
    <Tooltip label={t1.fullscreenTips} placement='left-end'>
      <Box onClick={() => onFullscreenChange(false)} cursor='pointer'>
        <FaTv />
      </Box>
    </Tooltip>
  )
}

export default Fullscreen
