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
import React, { useEffect } from "react"
import {
  useColorMode,
  useColorModeValue,
  IconButton,
  IconButtonProps,
  HStack,
  Text,
} from "@chakra-ui/react"
import { FaMoon, FaSun } from "react-icons/fa"
import { useStore } from "@nanostores/react"
import { sidebarMsg } from "src/i18n/locales/en"
import PopoverTooltip from "./PopoverTooltip"
import { upperFirst } from "lodash"
import { useSearchParam } from "react-use"

type ColorModeSwitcherProps = Omit<IconButtonProps, "aria-label">

export const ColorModeSwitcher: React.FC<ColorModeSwitcherProps & { miniMode: boolean, disableTrigger?: boolean }> = ({ miniMode,disableTrigger=false, ...props }) => {
  const t1 = useStore(sidebarMsg)
  const { toggleColorMode, setColorMode  } = useColorMode()
  const text = useColorModeValue("dark", "light")
  const { colorMode } = useColorMode()

  const cm = useSearchParam("colorMode")
  useEffect(() => {
    if (cm == "light" || cm == "dark") {
      setColorMode(cm)
    }
  },[cm])
  
  const textComponent = <Text fontSize="0.9rem">{t1.themeChange + upperFirst(colorMode)}</Text>
  return (
    <PopoverTooltip
      trigger={disableTrigger ? null : (miniMode ? "hover" : null)}
      offset={[0, 14]}
      triggerComponent={<HStack cursor="pointer" onClick={toggleColorMode} className="hover-text" spacing={3} >
        {miniMode ? <IconButton
          size="md"
          fontSize="lg"
          variant="ghost"
          color="current"
          icon={colorMode == 'light' ? <FaSun /> : <FaMoon />}
          aria-label={`Switch to ${text} mode`}
          {...props}
        /> : (colorMode == 'light' ? <FaSun /> : <FaMoon />)}
        {!miniMode && textComponent}
      </HStack>}
      headerComponent={textComponent}
    />

  )
}
