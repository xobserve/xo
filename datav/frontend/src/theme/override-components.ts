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

import { mode } from '@chakra-ui/theme-tools'
import customColors from './colors'

const components = {
  Modal: {
    baseStyle: (props) => ({
      dialog: {
        bg: mode(customColors.modalBg.light, customColors.modalBg.dark)(props),
      },
    }),
  },
  Drawer: {
    baseStyle: (props) => ({
      dialog: {
        bg: mode(customColors.modalBg.light, customColors.modalBg.dark)(props),
      },
    }),
  },
  Menu: {
    baseStyle: (props) => ({
      list: {
        bg: mode(
          customColors.popperBg.light,
          customColors.popperBg.dark,
        )(props),
      },
      item: {
        bg: mode(
          customColors.popperBg.light,
          customColors.popperBg.dark,
        )(props),
        _hover: {
          color: mode(
            customColors.hoverItem.light,
            customColors.hoverItem.dark,
          )(props),
        },
        _focus: {
          color: 'brand.500',
        },
      },
    }),
  },
  Popover: {
    baseStyle: (props) => ({
      content: {
        bg: mode(
          customColors.popperBg.light,
          customColors.popperBg.dark,
        )(props),
      },
    }),
  },
  Select: {
    baseStyle: (props) => ({
      field: {
        bg: mode(
          customColors.popperBg.light,
          customColors.popperBg.dark,
        )(props),
      },
    }),
  },
}

export default components
