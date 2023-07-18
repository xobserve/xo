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
