// Copyright 2023 xObserve.io Team

import React, { useEffect } from 'react'
import {
  useColorMode,
  useColorModeValue,
  IconButton,
  IconButtonProps,
  HStack,
  Text,
} from '@chakra-ui/react'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useStore } from '@nanostores/react'
import { sidebarMsg } from 'src/i18n/locales/en'
import PopoverTooltip from './PopoverTooltip'
import { upperFirst } from 'lodash'
import { useSearchParam } from 'react-use'

type ColorModeSwitcherProps = Omit<IconButtonProps, 'aria-label'>

export const ColorModeSwitcher: React.FC<
  ColorModeSwitcherProps & { miniMode: boolean; disableTrigger?: boolean }
> = ({ miniMode, disableTrigger = false, ...props }) => {
  const t1 = useStore(sidebarMsg)
  const { toggleColorMode, setColorMode } = useColorMode()
  const text = useColorModeValue('dark', 'light')
  const { colorMode } = useColorMode()

  const cm = useSearchParam('colorMode')
  useEffect(() => {
    if (cm == 'light' || cm == 'dark') {
      setColorMode(cm)
    }
  }, [cm])

  const textComponent = (
    <Text fontSize='1em'>{t1.themeChange + upperFirst(colorMode)}</Text>
  )
  return (
    <PopoverTooltip
      trigger={disableTrigger ? null : miniMode ? 'hover' : null}
      offset={[0, 14]}
      triggerComponent={
        <HStack
          cursor='pointer'
          onClick={toggleColorMode}
          className='hover-text'
          spacing={3}
        >
          {miniMode ? (
            <IconButton
              size='md'
              fontSize='lg'
              variant='ghost'
              color='current'
              icon={colorMode == 'light' ? <FaSun /> : <FaMoon />}
              aria-label={`Switch to ${text} mode`}
              {...props}
            />
          ) : colorMode == 'light' ? (
            <FaSun />
          ) : (
            <FaMoon />
          )}
          {!miniMode && textComponent}
        </HStack>
      }
      headerComponent={textComponent}
    />
  )
}
