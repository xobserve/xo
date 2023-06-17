import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react"

interface FormProps {
    size?: "sm" | "md" | "lg"
    children: any
}
export const Form = ({size="md", children}:FormProps) => {
    return (<VStack alignItems="left" spacing={4} fontSize={size}>
        {children}
    </VStack>)
}

interface FormItemProps {
    children: any
    title: string
    desc?: string
    horizontal?: boolean
}

export const FormItem = ({children,title,desc,horizontal}:FormItemProps) => {
    return <>{
        horizontal ?
            <Box>
                <HStack>
                    <Text textStyle="title">{title}</Text>
                    {children}
                </HStack>
                {desc && <Text textStyle="annotation" mb="2">{desc}</Text>}
            </Box>  :  
            <Box>
                <Text textStyle="title" mb={desc ? 0 : 1}>{title}</Text>
                {desc && <Text textStyle="annotation" mb="2">{desc}</Text>}
                {children}
            </Box>
    }
    </>
   
}

