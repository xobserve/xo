// Copyright 2023 xObserve.io Team

import { Button, HStack, Wrap } from '@chakra-ui/react'
import React from 'react'
import { isEmpty } from 'utils/validate'

interface Props {
  options: Option[]
  value: string[] // selected value
  onChange: any
  size?: 'xs' | 'sm' | 'md' | 'lg'
  spacing?: number
  fontSize?: string
  theme?: 'brand' | 'default'
}

interface Option {
  label: string
  value: string
}

const MultiRadionButtons = ({
  options,
  value,
  onChange,
  size = 'md',
  spacing = 1,
  fontSize = '0.9rem',
  theme = 'default',
}: Props) => {
  return (
    <Wrap spacing={spacing}>
      {options.map((o) => (
        <Button
          key={o.label}
          fontSize={fontSize}
          fontWeight={size != 'xs' ? 550 : 400}
          size={size}
          onClick={() => {
            if (isEmpty(value)) {
              onChange([o.value])
              return
            }
            if (value.includes(o.value)) {
              onChange(value.filter((v: string) => v != o.value))
            } else {
              onChange([...value, o.value])
            }
          }}
          borderRadius='0'
          variant={
            value?.includes(o.value)
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

export default MultiRadionButtons
