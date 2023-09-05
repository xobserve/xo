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

import React from 'react'
import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { ConfigProvider, theme } from "antd";
import customColors from "src/theme/colors";
import { useSearchParam } from 'react-use';

const AntdWrapper = ({ children }) => {
    const edit = useSearchParam("edit")
    const { colorMode } = useColorMode()
    const { defaultAlgorithm, darkAlgorithm } = theme;
    
    return (<Box sx={{
        // set right border of antd Table header to null
        'th.ant-table-cell:before': {
            width: '0 !important'
        },
        'th.ant-table-cell': {
            color: `${useColorModeValue(customColors.primaryColor.light,customColors.primaryColor.dark )} !important`
        }
    }}>
        <ConfigProvider
            theme={{
                algorithm: colorMode == "light" ? defaultAlgorithm : darkAlgorithm,
                token: {
                    colorBgContainer: colorMode == "light" ? customColors.bodyBg.light : (edit ? customColors.modalBg.dark : 'transparent'),
                    colorPrimary: colorMode == "light" ? customColors.primaryColor.light : customColors.primaryColor.dark,
                    colorBgElevated: colorMode == "light" ? customColors.popperBg.light : customColors.popperBg.dark,
                    colorBgSpotlight: colorMode == "light" ? customColors.tooltipBg.light : customColors.tooltipBg.dark,
                    colorBorderSecondary: colorMode == "light" ? customColors.borderColor.light : customColors.borderColor.dark,
                    zIndexPopupBase: 1500,
                    colorBorder: "var(--chakra-colors-chakra-border-color)"
                },
            }}>
            {children}
        </ConfigProvider>
    </Box>)
}

export default AntdWrapper