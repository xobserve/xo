// Copyright 2023 xObserve.io Team

import React, { ReactNode } from 'react'
import { Select, SelectProps } from 'antd'
import styled from '@emotion/styled'

type AntdSelectProps = SelectProps & {
  prefixIcon?: ReactNode
}

const SelectWrapper = styled.div`
  position: relative;
  .prefix-icon-wrapper {
    position: absolute;
    z-index: 1;
    width: 2.2rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  && .ant-select .ant-select-selector .ant-select-selection-placeholder {
    padding-left: calc(3rem - 27px);
  }

  && .ant-select .ant-select-selector .ant-select-selection-overflow {
    padding-left: calc(3rem - 12px);
  }
`

const CustomSelect = ({ prefixIcon, children, ...rest }: AntdSelectProps) => {
  return (
    <SelectWrapper>
      {prefixIcon && <div className='prefix-icon-wrapper'>{prefixIcon}</div>}
      <Select {...rest}>{children}</Select>
    </SelectWrapper>
  )
}

export default CustomSelect
