// Copyright 2023 xObserve.io Team
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

import React from "react"
import InputWithTips from "./InputWithTips"


interface Props {
    value: string
    onChange: any
    onConfirm: any
    width?: number | string
    placeholder?: string
    size?: "xs" | "sm" | "md" | "lg"
    children: any
}
const SearchInput = ({ value, onChange, onConfirm, width = "100%", placeholder = "Search...", size = "sm", children }: Props) => {
    return <InputWithTips placeholder={placeholder} width={width} value={value} onChange={onChange} onConfirm={onConfirm} size={size}>
        {children}
    </InputWithTips>
}

export default SearchInput