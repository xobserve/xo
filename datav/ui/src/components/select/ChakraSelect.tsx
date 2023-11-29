// Copyright 2023 xObserve.io Team

import React from 'react'
import { Select } from 'chakra-react-select'
import { SizeProp, Variant } from 'chakra-react-select/dist/types/types'

interface Value {
  value: string | number
  label: string
}

interface SelectProps {
  value?: Value
  onChange: (value: string) => void
  options: Value[]
  variant?: Variant
  components?: any
  placeholder?: string
  size?: SizeProp
  isClearable?: boolean
}

const ChakraSelect = ({
  value,
  options,
  onChange,
  variant = 'unstyled',
  components = null,
  placeholder = '',
  size = 'sm',
  isClearable = false,
}: SelectProps) => {
  return (
    <Select
      menuPortalTarget={document.body}
      styles={{
        menuPortal: (provided) => ({ ...provided, zIndex: 1401 }),
      }}
      value={value}
      menuPlacement='bottom'
      placeholder={placeholder}
      variant={variant}
      size={size}
      options={options}
      onChange={(v: any) => {
        onChange(v.value)
      }}
      components={components}
      isClearable={isClearable}
    />
  )
}

export default ChakraSelect
