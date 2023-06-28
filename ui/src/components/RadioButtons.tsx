import { Button, HStack } from "@chakra-ui/react"

interface Props {
    options: Option[]
    value: string | boolean // selected value
    onChange: any
    size?: "sm" | "md" | "lg"
}

interface Option {
    label: string 
    value: string | boolean
}

const RadionButtons = ({options,value,onChange,size="md"}:Props) => {
    return (<HStack spacing="1">
        {options.map(o => <Button size={size} onClick={() => onChange(o.value)} borderRadius="0" variant={value == o.value ? "solid" :"outline"} colorScheme="gray">{o.label}</Button>)}
    </HStack>)
}

export default RadionButtons