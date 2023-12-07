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
