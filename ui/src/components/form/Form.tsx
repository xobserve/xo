import { Box, Flex, HStack, StackDivider, StyleProps, Text, VStack } from "@chakra-ui/react"
import { StyleSize } from "types/styles"

interface FormProps {
    children: any
    spacing?: number
    sx?: any
}
export const Form = ({ children, spacing = 4, ...rest }: FormProps & StyleProps) => {
    return (<VStack alignItems="left" spacing={spacing} {...rest}>
        {children}
    </VStack>)
}

interface FormItemProps {
    children: any
    title?: string
    spacing?: number
    bordered?: boolean
    titleSize?: string
}

export const FormSection = ({ children, title=null,spacing=2, bordered=false,titleSize="1rem", ...rest }: FormItemProps & StyleProps) => {
    return <>

        <VStack alignItems="left" spacing={spacing} className={`${bordered ? "bordered" : ""}`} {...rest}>
            {title && <Text textStyle="title" mb={1} fontSize={titleSize}>{title}</Text>}
            {children}
        </VStack>
    </>

}


