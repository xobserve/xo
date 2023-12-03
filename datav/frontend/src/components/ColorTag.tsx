// Copyright 2023 xObserve.io Team

import { Tag, TagCloseButton, TagLabel, useColorMode } from '@chakra-ui/react'
import React from 'react'
import colorGenerator from 'utils/colorGenerator'
import { getTextColorForAlphaBackground } from 'utils/colors'
import paletteGenerator from 'utils/paletteGenerator'

interface Props {
  name: string
  label?: string
  onRemove?: any
  style?: Object
  onClick?: any
}
const ColorTag = ({ name, onRemove, style, label, onClick }: Props) => {
  const { colorMode } = useColorMode()
  const bg = colorGenerator.getColorByKey(name)
  return (
    <Tag
      style={style}
      bg={bg}
      color={getTextColorForAlphaBackground(bg, colorMode == 'dark')}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      borderRadius={2}
      onClick={onClick}
    >
      <TagLabel>{label ?? name}</TagLabel>
      {onRemove && <TagCloseButton onClick={onRemove} />}
    </Tag>
  )
}

export default ColorTag
