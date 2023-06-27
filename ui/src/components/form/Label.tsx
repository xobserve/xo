import { Box, Flex, HStack, Text, Tooltip } from "@chakra-ui/react"
import { IoMdInformationCircleOutline } from "react-icons/io"

const Label = ({children,width="fit-content",desc=null,px=2,py='5px'}) => {
    return (
        <Flex justifyContent="space-between" alignItems="center" className="label-bg" py={py} px={px} width={width} minWidth="fit-content" borderRadius="1px" fontSize="0.9rem">
            <Text >{children}</Text>
            {desc && <Tooltip label={desc}><Box><IoMdInformationCircleOutline /></Box></Tooltip>}
        </Flex>
    )
}

export default Label