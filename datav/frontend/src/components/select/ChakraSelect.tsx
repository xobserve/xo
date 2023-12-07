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
