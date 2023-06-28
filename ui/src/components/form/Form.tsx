import { Box, Flex, HStack, StackDivider, Text, VStack } from "@chakra-ui/react"
import { StyleSize } from "types/styles"

interface FormProps {
    children: any
    divided?: boolean
    spacing?: number
    divider?: boolean
}
export const Form = ({children,divider=false,spacing=5}:FormProps) => {
    return (<VStack alignItems="left" spacing={spacing} divider={divider? <StackDivider />: null}>
        {children}
    </VStack>)
}

interface FormItemProps {
    children: any
    title: string
    desc?: string
    horizontal?: boolean
    width?: string
}

export const FormItem = ({children,title,desc,horizontal,width="260px"}:FormItemProps) => {
    return <>{
        horizontal ?
            <Box>
                <HStack>
                    <Text textStyle="title">{title}</Text>
                    <Box width={width}>{children}</Box>
                </HStack>
                {desc && <Text textStyle="annotation" mb="2">{desc}</Text>}
            </Box>  :  
            <Box>
                <Text textStyle="title" mb={desc ? 1 : 1}>{title}</Text>
                {desc && <Text textStyle="annotation" mb="2">{desc}</Text>}
                <Box width={width}>{children}</Box>
            </Box>
    }
    </>
   
}

