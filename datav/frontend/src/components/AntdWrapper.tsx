// Copyright 2023 xObserve.io Team

import React from 'react'
import {
  Box,
  useColorMode,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react'
import { ConfigProvider, theme } from 'antd'
import customColors from 'src/theme/colors'
import { useSearchParam } from 'react-use'

const AntdWrapper = ({ children }) => {
  const edit = useSearchParam('edit')
  const { colorMode } = useColorMode()
  const { defaultAlgorithm, darkAlgorithm } = theme
  const chakraTheme = useTheme()
  return (
    <Box
      sx={{
        // set right border of antd Table header to null
        'th.ant-table-cell:before': {
          width: '0 !important',
        },
        'th.ant-table-cell': {
          color: `${useColorModeValue(
            customColors.primaryColor.light,
            customColors.primaryColor.dark,
          )} !important`,
        },
      }}
    >
      <ConfigProvider
        theme={{
          algorithm: colorMode == 'light' ? defaultAlgorithm : darkAlgorithm,
          token: {
            colorBgContainer:
              colorMode == 'light'
                ? customColors.bodyBg.light
                : edit
                ? customColors.modalBg.dark
                : 'transparent',
            colorPrimary:
              colorMode == 'light'
                ? chakraTheme.colors.brand[600]
                : chakraTheme.colors.brand[200],
            colorBgElevated:
              colorMode == 'light'
                ? customColors.popperBg.light
                : customColors.popperBg.dark,
            colorBgSpotlight:
              colorMode == 'light'
                ? customColors.tooltipBg.light
                : customColors.tooltipBg.dark,
            colorBorderSecondary:
              colorMode == 'light'
                ? customColors.borderColor.light
                : customColors.borderColor.dark,
            zIndexPopupBase: 1500,
            colorBorder: 'var(--chakra-colors-chakra-border-color)',
            fontSize: customColors.baseFontSize,
          },
          components: {
            Select: {
              optionSelectedColor:
                colorMode == 'light'
                  ? chakraTheme.colors.brand[600]
                  : chakraTheme.colors.brand[200],
              optionSelectedBg: 'transparent',
            },
            Table: {
              cellFontSize: customColors.baseFontSize * 0.9,
              cellFontSizeMD: customColors.baseFontSize * 0.9,
              cellFontSizeSM: customColors.baseFontSize * 0.9,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </Box>
  )
}

export default AntdWrapper
