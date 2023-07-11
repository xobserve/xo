import { Button, HStack } from "@chakra-ui/react"

interface Props {
    options: Option[]
    value: string | boolean // selected value
    onChange: any
    size?: "sm" | "md" | "lg"
    spacing?: number
    fontSize?: string
}

interface Option {
    label: string 
    value: string | boolean
}

const RadionButtons = ({options,value,onChange,size="md",spacing=1,fontSize="1rem"}:Props) => {
    return (<HStack spacing={spacing}>
        {options.map(o => <Button fontSize={fontSize}  size={size} onClick={() => onChange(o.value)} borderRadius="0" variant={value == o.value ? "solid" :"outline"} colorScheme="gray">{o.label}</Button>)}
    </HStack>)
}

export default RadionButtons