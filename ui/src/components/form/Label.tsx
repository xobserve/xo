import { Box, Flex, HStack, Text, Tooltip } from "@chakra-ui/react"
import { IoMdInformationCircleOutline } from "react-icons/io"

const Label = ({children,width="fit-content",desc=null}) => {
    return (
        <Flex justifyContent="space-between" alignItems="center" className="label-bg" py="5px" px="2" width={width} minWidth="fit-content" borderRadius="1px" fontSize="0.9rem">
            <Text >{children}</Text>
            {desc && <Tooltip label={desc}><Box><IoMdInformationCircleOutline /></Box></Tooltip>}
        </Flex>
    )
}

export default Label