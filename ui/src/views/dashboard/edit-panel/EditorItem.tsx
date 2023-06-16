import { Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Textarea } from "@chakra-ui/react"
import { useState } from "react"

interface EditorInputProps {
    type?: string
    value: string
    onChange: any
    size?: string
}

export const EditorInputItem = ({ value, onChange, type="input", size = "sm" }: EditorInputProps) => {
    const [temp, setTemp] = useState(value)
    switch (type) {
        case "input":
            return (
                <Input size={size} value={temp} onChange={e => setTemp(e.currentTarget.value)} onBlur={() => onChange(temp)} />
            )
        case "textarea":
            return (
                <Textarea size={size} value={temp} onChange={e => setTemp(e.currentTarget.value)} onBlur={() => onChange(temp)} />
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
}

export const EditorNumberItem = ({ value, onChange, min=0,max=10,step, size = "sm" }: NumberInputProps) => {
    const [temp, setTemp] = useState(value.toString())
    return (
            <NumberInput value={temp}  min={min} max={max}  size={size} step={step} onChange={v => setTemp(v)} onBlur={() => onChange(temp)}>
                <NumberInputField />
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
