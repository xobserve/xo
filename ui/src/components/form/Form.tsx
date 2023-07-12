import { Box, HStack,  StyleProps, Text, Tooltip, VStack } from "@chakra-ui/react"
import React from "react"
import { IoMdInformationCircleOutline } from "react-icons/io"

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
    size?
    titleSize?: string
    desc?: string
}

export const FormSection = ({ children, title = null, spacing = 2, bordered = false, titleSize = "1rem", desc = null, ...rest }: FormItemProps & StyleProps) => {
    return <>

        <VStack alignItems="left" spacing={spacing} className={`${bordered ? "bordered" : ""}`} {...rest}>
            {title && <HStack  mb={1} spacing={1}>
                <Text textStyle="title" fontSize={titleSize}>{title}</Text>
                {desc && <Tooltip label={desc}><Box><IoMdInformationCircleOutline /></Box></Tooltip>}
            </HStack>}
            {children}
        </VStack>
    </>

}


