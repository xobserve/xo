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

import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import flattenDeep from 'lodash/flattenDeep'
import chunk from 'lodash/chunk'
import zip from 'lodash/zip'
import tinycolor from 'tinycolor2'
import { isEmpty } from 'lodash'
import { initPanelStyles } from 'src/data/panel/initStyles'

export const PALETTE_ROWS = 4
export const PALETTE_COLUMNS = 14
export const DEFAULT_ANNOTATION_COLOR = 'rgba(0, 211, 255, 1)'
export const OK_COLOR = 'rgba(11, 237, 50, 1)'
export const ALERTING_COLOR = 'rgba(237, 46, 24, 1)'
export const NO_DATA_COLOR = 'rgba(150, 150, 150, 1)'
export const PENDING_COLOR = 'rgba(247, 149, 32, 1)'
export const REGION_FILL_ALPHA = 0.09

export const primaryPalette = '$green'
export const lightPalettes = [
  {
    name: 'green',
    shades: [
      {
        color: '#96D98D',
        name: '$super-light-green',
        aliases: [],
      },
      {
        color: '#73BF69',
        name: '$light-green',
        aliases: [],
      },
      {
        color: '#56A64B',
        name: primaryPalette,
        aliases: [],
        primary: true,
      },
      {
        color: '#37872D',
        name: '$semi-dark-green',
        aliases: [],
      },
      {
        color: '#19730E',
        name: '$dark-green',
        aliases: [],
      },
    ],
  },
  {
    name: 'yellow',
    shades: [
      {
        color: '#FFEE52',
        name: '$super-light-yellow',
        aliases: [],
      },
      {
        color: '#FADE2A',
        name: '$light-yellow',
        aliases: [],
      },
      {
        color: '#F2CC0C',
        name: '$yellow',
        aliases: [],
        primary: true,
      },
      {
        color: '#E0B400',
        name: '$semi-dark-yellow',
        aliases: [],
      },
      {
        color: '#CC9D00',
        name: '$dark-yellow',
        aliases: [],
      },
    ],
  },
  {
    name: 'orange',
    shades: [
      {
        color: '#FFB357',
        name: '$super-light-orange',
        aliases: [],
      },
      {
        color: '#FF9830',
        name: '$light-orange',
        aliases: [],
      },
      {
        color: '#FF780A',
        name: '$orange',
        aliases: [],
        primary: true,
      },
      {
        color: '#FA6400',
        name: '$semi-dark-orange',
        aliases: [],
      },
      {
        color: '#E55400',
        name: '$dark-orange',
        aliases: [],
      },
    ],
  },
  {
    name: 'red',
    shades: [
      {
        color: '#FF7383',
        name: '$super-light-red',
      },
      {
        color: '#F2495C',
        name: '$light-red',
      },
      {
        color: '#E02F44',
        name: '$red',
        primary: true,
      },
      {
        color: '#C4162A',
        name: '$semi-dark-red',
      },
      {
        color: '#AD0317',
        name: '$dark-red',
      },
    ],
  },
  {
    name: 'blue',
    shades: [
      {
        color: '#8AB8FF',
        name: '$super-light-blue',
        aliases: [],
      },
      {
        color: '#5794F2',
        name: '$light-blue',
        aliases: [],
      },
      {
        color: '#3274D9',
        name: '$blue',
        aliases: [],
        primary: true,
      },
      {
        color: '#1F60C4',
        name: '$semi-dark-blue',
        aliases: [],
      },
      {
        color: '#1250B0',
        name: '$dark-blue',
        aliases: [],
      },
    ],
  },
  {
    name: 'purple',
    shades: [
      {
        color: '#CA95E5',
        name: '$super-light-purple',
        aliases: [],
      },
      {
        color: '#B877D9',
        name: '$light-purple',
        aliases: [],
      },
      {
        color: '#A352CC',
        name: '$purple',
        aliases: [],
        primary: true,
      },
      {
        color: '#8F3BB8',
        name: '$semi-dark-purple',
        aliases: [],
      },
      {
        color: '#7C2EA3',
        name: '$dark-purple',
        aliases: [],
      },
    ],
  },
]

export const darkPalettes = [
  {
    name: 'green',
    shades: [
      {
        color: '#C8F2C2',
        name: '$super-light-green',
        aliases: [],
      },
      {
        color: '#96D98D',
        name: '$light-green',
        aliases: [],
      },
      {
        color: '#73BF69',
        name: primaryPalette,
        aliases: [],
        primary: true,
      },
      {
        color: '#56A64B',
        name: '$semi-dark-green',
        aliases: [],
      },
      {
        color: '#37872D',
        name: '$dark-green',
        aliases: [],
      },
    ],
  },

  {
    name: 'yellow',
    shades: [
      {
        color: '#FFF899',
        name: '$super-light-yellow',
        aliases: [],
      },
      {
        color: '#FFEE52',
        name: '$light-yellow',
        aliases: [],
      },
      {
        color: '#FADE2A',
        name: '$yellow',
        aliases: [],
        primary: true,
      },
      {
        color: '#F2CC0C',
        name: '$semi-dark-yellow',
        aliases: [],
      },
      {
        color: '#E0B400',
        name: '$dark-yellow',
        aliases: [],
      },
    ],
  },
  {
    name: 'orange',
    shades: [
      {
        color: '#FFCB7D',
        name: '$super-light-orange',
        aliases: [],
      },
      {
        color: '#FFB357',
        name: '$light-orange',
        aliases: [],
      },
      {
        color: '#FF9830',
        name: '$orange',
        aliases: [],
        primary: true,
      },
      {
        color: '#FF780A',
        name: '$semi-dark-orange',
        aliases: [],
      },
      {
        color: '#FA6400',
        name: '$dark-orange',
        aliases: [],
      },
    ],
  },
  {
    name: 'red',
    shades: [
      {
        color: '#FFA6B0',
        name: '$super-light-red',
      },
      {
        color: '#FF7383',
        name: '$light-red',
      },
      {
        color: '#F2495C',
        name: '$red',
        primary: true,
      },
      {
        color: '#E02F44',
        name: '$semi-dark-red',
      },
      {
        color: '#C4162A',
        name: '$dark-red',
      },
    ],
  },
  {
    name: 'blue',
    shades: [
      {
        color: '#C0D8FF',
        name: '$super-light-blue',
        aliases: [],
      },
      {
        color: '#8AB8FF',
        name: '$light-blue',
        aliases: [],
      },
      {
        color: '#5794F2',
        name: '$blue',
        aliases: [],
        primary: true,
      },
      {
        color: '#3274D9',
        name: '$semi-dark-blue',
        aliases: [],
      },
      {
        color: '#1F60C4',
        name: '$dark-blue',
        aliases: [],
      },
    ],
  },
  {
    name: 'purple',
    shades: [
      {
        color: '#DEB6F2',
        name: '$super-light-purple',
        aliases: [],
      },
      {
        color: '#CA95E5',
        name: '$light-purple',
        aliases: [],
      },
      {
        color: '#B877D9',
        name: '$purple',
        aliases: [],
        primary: true,
      },
      {
        color: '#A352CC',
        name: '$semi-dark-purple',
        aliases: [],
      },
      {
        color: '#8F3BB8',
        name: '$dark-purple',
        aliases: [],
      },
    ],
  },
]

// classic colors
export const colors = []
// classic palettes
export const palettes = []
// echarts light
export const colors1 = [
  '#9FE6B8',
  '#37A2DA',
  '#32C5E9',
  '#67E0E3',
  '#FFDB5C',
  '#ff9f7f',
  '#fb7293',
  '#E062AE',
  '#E690D1',
  '#e7bcf3',
  '#9d96f5',
  '#8378EA',
  '#96BFFF',
]
// echarts dark
export const colors2 = [
  '#7cffb2',
  '#4992ff',
  '#fddd60',
  '#ff6e76',
  '#58d9f9',
  '#05c091',
  '#ff8a45',
  '#8d48e3',
  '#dd79ff',
]
// jaeger colors
export const colors3 = [
  '#17B8BE',
  '#F8DCA1',
  '#B7885E',
  '#FFCB99',
  '#F89570',
  '#829AE3',
  '#E79FD5',
  '#1E96BE',
  '#89DAC1',
  '#B3AD9E',
  '#12939A',
  '#DDB27C',
  '#88572C',
  '#FF9833',
  '#EF5D28',
  '#162A65',
  '#DA70BF',
  '#125C77',
  '#4DC19C',
  '#776E57',
]

const sequences = [2, 1, 0, 3, 4]
for (var i = 0; i <= 4; i++) {
  const seq = sequences[i]
  for (const palette of darkPalettes) {
    palettes.push(palette.shades[seq].name)
  }
}

export const barPalettes = []
const sequences1 = [1, 0, 2, 3, 4]
for (var i = 0; i <= 4; i++) {
  const seq = sequences1[i]
  for (const palette of darkPalettes) {
    barPalettes.push(palette.shades[seq].name)
  }
}

export const initColors = (colorMode) => {
  if (colorMode === 'dark') {
    colors.splice(0, colors.length)
    for (var i = 0; i <= 4; i++) {
      const seq = sequences[i]
      for (const palette of darkPalettes) {
        colors.push(palette.shades[seq].color)
      }
    }
  } else {
    colors.splice(0, colors.length)
    for (var i = 0; i <= 4; i++) {
      const seq = sequences[i]
      for (const palette of lightPalettes) {
        colors.push(palette.shades[seq].color)
      }
    }
  }
}

export const paletteMap = {
  classic: palettes,
  'echarts-light': colors1,
  'echarts-dark': colors2,
  jaeger: colors3,
}

function sortColorsByHue(hexColors: string[]) {
  const hslColors = map(hexColors, hexToHsl)

  const sortedHSLColors = sortBy(hslColors, ['h'])
  const chunkedHSLColors = chunk(sortedHSLColors, PALETTE_ROWS)
  const sortedChunkedHSLColors = map(chunkedHSLColors, (chunk) => {
    return sortBy(chunk, 'l')
  })
  const flattenedZippedSortedChunkedHSLColors = flattenDeep(
    zip(...sortedChunkedHSLColors),
  )

  return map(flattenedZippedSortedChunkedHSLColors, hslToHex)
}

function hexToHsl(color: string) {
  return tinycolor(color).toHsl()
}

function hslToHex(color: any) {
  return tinycolor(color).toHexString()
}

export const paletteColorNameToHex = (
  name: string,
  colorMode: 'light' | 'dark' = 'light',
) => {
  if (isEmpty(name)) {
    return name
  }

  if (name[0] != '$') {
    return name
  }

  const v = name.slice(1).split('-')
  const paletteName = v[v.length - 1]

  const palettes = colorMode == 'light' ? lightPalettes : darkPalettes
  const palette = palettes.find((p) => p.name == paletteName)
  const value = palette.shades.find((s) => s.name == name)
  return value?.color
}

export let sortedColors = sortColorsByHue(colors)

// get text color base on the background color
export function getTextColorForAlphaBackground(
  color: string,
  themeIsDark: boolean,
) {
  const tcolor = tinycolor(color)
  const b = tcolor.getBrightness()
  const a = tcolor.getAlpha()

  if (a < 0.3) {
    return themeIsDark ? 'rgb(247, 248, 250)' : 'rgb(32, 34, 38)'
  }

  return b > 180 ? 'rgb(32, 34, 38)' : 'rgb(247, 248, 250)'
}

// get gradient background color
export function getGradientBackgroundColor(
  color: string,
  themeIsDark: boolean,
) {
  const themeFactor = themeIsDark ? 1 : -0.7
  const bgColor2 = tinycolor(color)
    .darken(15 * themeFactor)
    .spin(8)
    .toRgbString()
  const bgColor3 = tinycolor(color)
    .darken(5 * themeFactor)
    .spin(-8)
    .toRgbString()

  return `linear-gradient(120deg, ${bgColor2}, ${bgColor3})`
}

export function getDefaultPanelColor() {
  const defaultPalette = initPanelStyles.palette
  const palette = paletteMap[defaultPalette]
  return paletteColorNameToHex(palette[0])
}
