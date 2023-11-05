// Copyright 2023 observex.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Box, HStack, StyleProps, Text, Tooltip, VStack } from "@chakra-ui/react"
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

export const FormSection = ({ children, title = null, spacing = 1, bordered = false, titleSize = "1em", desc = null, ...rest }: FormItemProps & StyleProps) => {
    return <>

        <VStack alignItems="left" spacing={spacing} className={`${bordered ? "bordered" : ""}`} {...rest}>
            {title && <HStack mb={1} spacing={1}>
                <Text textStyle="title" fontSize={titleSize}>{title}</Text>
                {desc && <Tooltip label={desc}><Box><IoMdInformationCircleOutline /></Box></Tooltip>}
            </HStack>}
            {children}
        </VStack>
    </>

}


