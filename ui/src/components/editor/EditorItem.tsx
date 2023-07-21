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
import { Input, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Textarea } from "@chakra-ui/react"
import { InputNumber } from "antd"
import React, { useState } from "react"

interface EditorInputProps {
    type?: "textarea" | "input"
    value: string
    onChange: any
    size?: string
    placeholder?: string
}

export const EditorInputItem = ({ value, onChange, type = "input", size = "md", placeholder }: EditorInputProps) => {
    const [temp, setTemp] = useState(value)
    switch (type) {
        case "input":
            return (
                <Input placeholder={placeholder} size={size} value={temp} onChange={e => setTemp(e.currentTarget.value)} onBlur={() => onChange(temp)} />
            )
        case "textarea":
            return (
                <Textarea placeholder={placeholder} size={size} value={temp} onChange={e => setTemp(e.currentTarget.value)} onBlur={() => onChange(temp)} />
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
}

// Value can be null or number 
// But if min is set, value can not be null
export const EditorNumberItem = ({ value, onChange, min = null, max = null, step = null, size = "md", placeholder = null }: NumberInputProps) => {
    const [temp, setTemp] = useState(value)
    return (
        <InputNumber placeholder={placeholder} size={size == "sm" ? "small" : "middle"} min={min} max={max} step={step} value={temp} onChange={v => setTemp(v === null ? (min !== null ? min : null) : v)} onBlur={() => onChange(temp)} />
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
