// Copyright 2023 xObserve.io Team

import React from 'react'
import InputWithTips from './InputWithTips'

interface Props {
  value: string
  onChange: any
  onConfirm: any
  width?: number | string
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  children: any
}
const SearchInput = ({
  value,
  onChange,
  onConfirm,
  width = '100%',
  placeholder = 'Search...',
  size = 'sm',
  children,
}: Props) => {
  return (
    <InputWithTips
      placeholder={placeholder}
      width={width}
      value={value}
      onChange={onChange}
      onConfirm={onConfirm}
      size={size}
    >
      {children}
    </InputWithTips>
  )
}

export default SearchInput
