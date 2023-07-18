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
import React from "react"
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

type ColorModeSwitcherProps = Omit<IconButtonProps, "aria-label">

export const ColorModeSwitcher: React.FC<ColorModeSwitcherProps & { miniMode: boolean }> = ({ miniMode, ...props }) => {
  const t1 = useStore(sidebarMsg)
  const { toggleColorMode } = useColorMode()
  const text = useColorModeValue("dark", "light")
  const SwitchIcon = useColorModeValue(FaMoon, FaSun)

  return (
    <HStack cursor="pointer" onClick={toggleColorMode}>
      {miniMode ? <IconButton
        size="md"
        fontSize="lg"
        variant="ghost"
        color="current"
        onClick={toggleColorMode}
        icon={<SwitchIcon />}
        aria-label={`Switch to ${text} mode`}
        {...props}
      /> : <SwitchIcon fontSize="1rem" />}
      {!miniMode && <Text fontSize="0.95rem">{t1.themeChange}</Text>}
    </HStack>
  )
}
