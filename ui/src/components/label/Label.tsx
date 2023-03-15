import { Text } from "@chakra-ui/react"

const Label = ({children}) => {
    return (
        <Text className="label-bg" py="5px" px="2" minWidth="fit-content" borderRadius="1px" fontSize="0.9rem">{children}</Text>
    )
}

export default Label