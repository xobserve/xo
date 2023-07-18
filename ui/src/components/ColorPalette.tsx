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
import {
  Box,
  Flex,
  FlexProps,
  Grid,
  GridProps,
  useTheme,
} from '@chakra-ui/react'
import React from 'react'

type ColorPaletteProps = FlexProps & { color?: string; name?: string }

export const ColorPalette = (props: ColorPaletteProps) => {
  const { color, name, ...rest } = props

  const theme = useTheme()
  let colorCode = color
  const [shade, hue] = color.split('.')

  if (shade && hue) {
    colorCode = theme.colors[shade][hue]
  }

  if (color in theme.colors && typeof theme.colors[color] === 'string') {
    colorCode = theme.colors[color]
  }

  return (
    <Flex align='center' {...rest}>
      <Box
        borderRadius='md'
        boxSize='3rem'
        boxShadow='inner'
        mr={3}
        bgColor={color}
      />
      <Box fontSize='sm'>
        <Box fontWeight='semibold' textTransform='capitalize'>
          {name}
        </Box>
        <Box textTransform='uppercase'>{colorCode}</Box>
      </Box>
    </Flex>
  )
}

export const ColorPalettes = (props: { color: string }) => {
  const { color } = props
  const theme = useTheme()
  const keys = Object.keys(theme.colors[color])

  return keys.map((item) => (
    <ColorPalette
      key={`${color}.${item}`}
      color={`${color}.${item}`}
      name={`${color} ${item}`}
    />
  ))
}

export const ColorWrapper = (props: GridProps) => (
  <Grid
    mt={7}
    gap={6}
    templateColumns='repeat( auto-fit, minmax(200px, 1fr) )'
    {...props}
  />
)
