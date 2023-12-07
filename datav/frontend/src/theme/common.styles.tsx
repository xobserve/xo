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

import { Global, css } from '@emotion/react'
import { ChakraTheme, useColorMode } from '@chakra-ui/react'
import customColors from './colors'

const CommonStyles = () => (
  <Global
    styles={(theme: ChakraTheme) => {
      const { colorMode } = useColorMode()
      const scrollBg =
        colorMode == 'dark'
          ? customColors.scrollBg.dark
          : customColors.scrollBg.light
      return css`
        .dashboard-container {
          ::-webkit-scrollbar {
            width: ${colorMode == 'light' ? '5px' : '3px'};
            height: 3px;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:vertical {
            background: -webkit-gradient(
              linear,
              left top,
              right top,
              color-stop(0%, ${'rgba(36,41,46,0.15)'}),
              color-stop(100%, ${'rgba(36,41,46,0.15)'})
            );
          }
        }
        ::-webkit-scrollbar {
          width: 3px;
          height: 3px;
          border-radius: 4px;
        }

        ::-webkit-scrollbar:hover {
          height: 4px;
          width: 4px;
        }

        ::-webkit-scrollbar-button:start:decrement,
        ::-webkit-scrollbar-button:end:increment {
          display: none;
        }
        ::-webkit-scrollbar-button:horizontal:decrement {
          display: none;
        }
        ::-webkit-scrollbar-button:horizontal:increment {
          display: none;
        }
        ::-webkit-scrollbar-button:vertical:decrement {
          display: none;
        }
        ::-webkit-scrollbar-button:vertical:increment {
          display: none;
        }
        ::-webkit-scrollbar-button:horizontal:decrement:active {
          background-image: none;
        }
        ::-webkit-scrollbar-button:horizontal:increment:active {
          background-image: none;
        }
        ::-webkit-scrollbar-button:vertical:decrement:active {
          background-image: none;
        }
        ::-webkit-scrollbar-button:vertical:increment:active {
          background-image: none;
        }
        ::-webkit-scrollbar-track-piece {
          background-color: transparent;
        }

        ::-webkit-scrollbar-thumb:vertical {
          height: 50px;
          background: -webkit-gradient(
            linear,
            left top,
            right top,
            color-stop(0%, ${scrollBg}),
            color-stop(100%, ${scrollBg})
          );
          border: 1px solid ${scrollBg};
          border-top: 1px solid ${scrollBg};
          border-left: 1px solid ${scrollBg};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:horizontal {
          border-radius: 4px;
          width: 50px;
          background: -webkit-gradient(
            linear,
            left top,
            left bottom,
            color-stop(0%, ${scrollBg}),
            color-stop(100%, ${scrollBg})
          );
          border: 1px solid ${scrollBg};
          border-top: 1px solid ${scrollBg};
          border-left: 1px solid ${scrollBg};
        }
        .top-gradient-border {
          ::before {
            display: block;
            content: ' ';
            position: relative;
            height: 2px;

            background-image: linear-gradient(
              to right,
              #33a2e5 30%,
              #52c41a 99%
            );
          }
        }

        .chakra-slider__thumb {
          color: black;
        }

        .panel-decoration {
          z-index: 1;
        }

        .chakra-stack__divider {
          border-bottom-width: 0.5px !important;
        }

        .uplot .u-over {
          pointer-events: auto !important;
        }

        .color-border-table {
          td,
          th {
            border-bottom: 0.5px solid;
            border-color: ${colorMode == 'light'
              ? customColors.colorBorder.light
              : customColors.borderColor.dark};
          }
        }
      `
    }}
  />
)

export default CommonStyles
