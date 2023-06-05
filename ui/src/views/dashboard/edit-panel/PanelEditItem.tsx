import { Box, Text } from "@chakra-ui/react"

interface Props {
    title: string 
    desc?: string
    children: any
} 

const PanelEditItem = (props: Props) => {
    return (<Box>
        <Text fontSize="sm" layerStyle="textSecondary">{props.title}</Text>
        <Text fontSize="sm" layerStyle="textSecondary" mt="1">{props.desc}</Text>
        <Box mt="1">
            {props.children}
        </Box>
    </Box>)
}

export default PanelEditItem