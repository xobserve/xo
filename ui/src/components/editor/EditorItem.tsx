import { Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Textarea } from "@chakra-ui/react"
import { isEmpty } from "lodash"
import { useState } from "react"

interface EditorInputProps {
    type?: "textarea" | "input"
    value: string
    onChange: any
    size?: string
    placeholder?: string
}

export const EditorInputItem = ({ value, onChange, type="input", size = "md",placeholder }: EditorInputProps) => {
    const [temp, setTemp] = useState(value)
    switch (type) {
        case "input":
            return (
                <Input placeholder={placeholder} size={size} value={temp} onChange={e => setTemp(e.currentTarget.value)} onBlur={() => onChange(temp)} />
            )
        case "textarea":
            return (
                <Textarea placeholder={placeholder}  size={size} value={temp} onChange={e => setTemp(e.currentTarget.value)} onBlur={() => onChange(temp)} />
            )
    }
}

interface NumberInputProps {
    value: number
    onChange: any
    min?: number
    max?: number
    step?: number
    size?:string
    placeholder?: string
}

export const EditorNumberItem = ({ value, onChange, min,max,step=1, size = "sm",placeholder="" }: NumberInputProps) => {
    const [temp, setTemp] = useState(value.toString())
    const rangeProps = {}
    if (isEmpty(min)) rangeProps['min'] = min
    if (isEmpty(max)) rangeProps['max'] = max

    return (
            <NumberInput value={temp}  {...rangeProps} size={size} step={step} onChange={v => setTemp(v)} onBlur={() => onChange(Number(temp))}>
                <NumberInputField  placeholder={placeholder}/>
                {step && <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>}
            </NumberInput>
    )
}


export const EditorSliderItem = ({ value, onChange, min=0,max=10,step=1, size = "sm" }: NumberInputProps) => {
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
