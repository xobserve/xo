import { Button, HStack } from "@chakra-ui/react"

interface Props {
    options: Option[]
    value: string | boolean // selected value
    onChange: any
}

interface Option {
    label: string 
    value: string | boolean
}

const RadionButtons = (props:Props) => {
    return (<HStack spacing="1">
        {props.options.map(o => <Button onClick={() => props.onChange(o.value)} borderRadius="0" variant={props.value == o.value ? "solid" :"outline"} colorScheme="gray">{o.label}</Button>)}
    </HStack>)
}

export default RadionButtons