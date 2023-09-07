// Copyright 2023 Datav.io Team
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
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack, Textarea, useColorModeValue } from "@chakra-ui/react"
import { Input, InputNumber } from "antd"
import { Variant } from "chakra-react-select/dist/types/types"
import React, { useState } from "react"
import customColors from "theme/colors"

interface EditorInputProps {
    type?: "textarea" | "input"
    value: string
    onChange: any
    size?: string
    placeholder?: string
    disabled?: boolean
    bordered?: boolean
    borderedBottom?: boolean
}

export const EditorInputItem = ({ value, onChange, type = "input", size = "md", placeholder,disabled=false,bordered=true,borderedBottom=false}: EditorInputProps) => {
    const [temp, setTemp] = useState(value)
    switch (type) {
        case "input":
            return (
                <Input  width="100%" placeholder={placeholder} size={size == "sm" ? "small" : (size == "md"?  "middle" : "large")} bordered={bordered} style={borderedBottom && {borderBottom: `1px solid ${useColorModeValue(customColors.borderColor.light, customColors.borderColor.dark)}`, borderRadius: 0}}  value={temp} onChange={e => setTemp(e.currentTarget.value)} onBlur={() => onChange(temp)} disabled={disabled} />
            )
        case "textarea":
            return (
                <Textarea  placeholder={placeholder} size={size} value={temp} onChange={e => setTemp(e.currentTarget.value)} onBlur={() => onChange(temp)} />
            )
    }
}

interface NumberInputProps {
    value: number
    onChange: any
    min?: number
    max?: number
    step?: number
    size?: string
    placeholder?: string
    notNull?: boolean // when set to true, value can not be null
    defaultZero?:boolean
    bordered?:boolean
}

// Value can be null or number 
// But if min is set, value can not be null
export const EditorNumberItem = ({ value, onChange, min = null, max = null, step = null, size = "md", placeholder = null, notNull=false,defaultZero=true, bordered=true }: NumberInputProps) => {
    const [temp, setTemp] = useState(value)
    let newSize;
    switch (size) {
        case "sm":
            newSize = "small"
            break;
        case "md":
            newSize = "middle"
            break
        default:
            newSize = "large"
            break;
    }
    return (
        <InputNumber bordered={bordered}  placeholder={placeholder} size={newSize} min={min} max={max} step={step} controls={step !== null} value={temp} onChange={v => {
            setTemp(v === null ? (notNull ? (defaultZero ? 0 : min) : null) : v)
        }} onBlur={() => onChange(temp)} />
    )
}


export const EditorSliderItem = ({ value, onChange, min = 0, max = 10, step = 1, size = "sm" }: NumberInputProps) => {
    const [temp, setTemp] = useState(value)
    return (
        <Slider size={size} value={temp} min={min} max={max} step={step} onChange={v => setTemp(v)}
            onChangeEnd={v => onChange(v)}>
            <SliderTrack>
                <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb children={temp} fontSize='sm' boxSize='25px' />
        </Slider>
    )
}
