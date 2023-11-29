// Copyright 2023 xObserve.io Team

import { ValueCalculationType } from 'types/value'
import React from 'react'
import { Select } from 'antd'

interface Props {
  value: ValueCalculationType
  onChange: any
  size?: 'large' | 'middle' | 'small'
}
const ValueCalculation = ({ value, onChange, size = 'middle' }: Props) => {
  return (
    <>
      <Select
        value={value}
        onChange={onChange}
        size={size}
        popupMatchSelectWidth={false}
      >
        {Object.keys(ValueCalculationType).map((k) => (
          <option key={k} value={ValueCalculationType[k]}>
            {k}
          </option>
        ))}
      </Select>
    </>
  )
}

export default ValueCalculation
