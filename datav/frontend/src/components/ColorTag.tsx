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

import { Tag, TagCloseButton, TagLabel, useColorMode } from '@chakra-ui/react'
import React from 'react'
import colorGenerator from 'utils/colorGenerator'
import { getTextColorForAlphaBackground } from 'utils/colors'

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
      bg={bg}
      color={getTextColorForAlphaBackground(bg, colorMode == 'dark')}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      borderRadius={2}
      onClick={onClick}
      style={style}
    >
      <TagLabel>{label ?? name}</TagLabel>
      {onRemove && <TagCloseButton onClick={onRemove} />}
    </Tag>
  )
}

export default ColorTag
