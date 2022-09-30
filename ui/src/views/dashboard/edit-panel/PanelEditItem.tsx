import { Box, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Text } from "@chakra-ui/react"
import { FaInfoCircle } from "react-icons/fa"

interface Props {
    title: string
    desc?: string
    info?: any
    children: any
}

const PanelEditItem = (props: Props) => {
    return (<Box>
        <HStack>
            <Text fontSize="sm" layerStyle="textSecondary" fontWeight="550">{props.title}</Text>
            {props.info && <Popover trigger="hover">
                <PopoverTrigger>
                    <Box cursor="pointer" layerStyle="textFourth"><FaInfoCircle /></Box>
                </PopoverTrigger>
                <PopoverContent>
                    <PopoverArrow />
                    <PopoverBody>{props.info}</PopoverBody>
                </PopoverContent>
            </Popover>}
        </HStack>
        <Text fontSize="sm" layerStyle="textSecondary" mt="0">{props.desc}</Text>
        <Box mt="1">
            {props.children}
        </Box>
    </Box>)
}

export default PanelEditItem