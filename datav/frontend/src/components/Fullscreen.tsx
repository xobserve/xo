// Copyright 2023 xObserve.io Team

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
