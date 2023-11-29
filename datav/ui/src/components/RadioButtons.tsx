// Copyright 2023 xObserve.io Team

import { Button, HStack, Wrap } from '@chakra-ui/react'
import React from 'react'

interface Props {
  options: Option[]
  value: string | boolean // selected value
  onChange: any
  size?: 'xs' | 'sm' | 'md' | 'lg'
  spacing?: number
  fontSize?: string
  theme?: 'brand' | 'default'
  width?: number
}

interface Option {
  label: string
  value: string | boolean
}

const RadionButtons = ({
  options,
  value,
  onChange,
  size = 'md',
  spacing = 1,
  fontSize = '0.9rem',
  theme = 'default',
  width = null,
}: Props) => {
  return (
    <Wrap spacing={spacing} width={width}>
      {options.map((o) => (
        <Button
          key={o.label}
          fontWeight={size != 'xs' ? 550 : 400}
          fontSize={fontSize}
          size={size}
          onClick={() => onChange(o.value)}
          borderRadius='0'
          variant={
            value == o.value
              ? 'solid'
              : theme == 'default'
              ? 'outline'
              : 'ghost'
          }
          colorScheme={theme == 'default' ? 'gray' : 'brand'}
        >
          {o.label}
        </Button>
      ))}
    </Wrap>
  )
}

export default RadionButtons
