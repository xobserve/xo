import React from 'react'

import { Global, css } from "@emotion/react"
import { ChakraTheme, useColorMode } from '@chakra-ui/react'
import customColors from './colors'

const CommonStyles = () => (
 
  <Global
    styles={(theme: ChakraTheme) => {
      const {colorMode} = useColorMode()
      const scrollBg = colorMode == "dark" ? customColors.scrollBg.dark : customColors.scrollBg.light
      return css` 
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
          border-radius: 4px;
        }
      
        ::-webkit-scrollbar:hover {
          height: 8px;
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
          content:' ';
          position: relative;
          height: 2px;
      
          background-image: linear-gradient(to right,#33a2e5 30%,#52c41a 99%)
        }
      }

      .chakra-slider__thumb {
        color: black
      }

      .panel-decoration {
        z-index: 1
      }

      .chakra-stack__divider {
        border-bottom-width: 0.5px!important
      }

      .uplot .u-over {
        pointer-events: auto !important;
      }
    `}}
  />
)

export default CommonStyles
