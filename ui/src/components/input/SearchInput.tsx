import { Text } from "@chakra-ui/react"
import InputWithTips from "./InputWithTips"

interface Props {
    value: string 
    onChange: any
    onConfirm: any
    width?: number | string
    placeholder?: string
    size?: "xs" | "sm" | "md" | "lg"
}
const SearchInput = ({value,onChange,onConfirm, width="100%", placeholder="Search...",size="sm"}: Props) => {
    return <InputWithTips placeholder={placeholder} width={width} value={value} onChange={onChange} onConfirm={onConfirm} size={size}>
    <Text>aaaa</Text>
</InputWithTips>
}

export default SearchInput