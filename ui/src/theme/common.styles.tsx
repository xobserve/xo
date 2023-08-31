import React from 'react'

import { Global, css } from "@emotion/react"
import { ChakraTheme, useColorMode } from '@chakra-ui/react'

const CommonStyles = () => (
 
  <Global
    styles={(theme: ChakraTheme) => {
      const {colorMode} = useColorMode()
      return css` 
      .thin-scroller {
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }   
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
