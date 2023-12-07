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

export default function layerStyles(theme) {
  return {
    textSecondary: {
      opacity: '0.8',
    },
    textThird: {
      opacity: '0.7',
    },
    textFourth: {
      opacity: 0.6,
      fontSize: '0.8rem',
    },
    colorButton: {
      // linear-gradient(270deg,#0076f5,#0098a3)
      bgGradient: 'radial(yellow.400, pink.200)',
      color: 'white',
      _hover: {
        cursor: 'pointer',
      },
      _focus: null,
    },
    cardHeader: {
      px: '4',
      py: '3',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    gradientText: {
      backgroundClip: 'text',
      color: 'transparent',
      backgroundImage:
        'linear-gradient(to right bottom, rgb(52, 102, 246), rgb(124, 188, 237))',
    },
    gradientBg: {
      bg: 'linear-gradient(to right bottom, rgb(52, 102, 246), rgb(124, 58, 237))',
    },
  }
}
