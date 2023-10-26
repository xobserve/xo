// Copyright 2023 Datav.io Team
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

import React from "react"
import { Box, Card, CardBody, CardHeader, Stack, StackDivider } from "@chakra-ui/react"



interface Props {
    title: string
    children: any
}

const CardSelect = ({title,children}:Props) => {
    return (
        <Card>
            <CardHeader pb="2" p="1" fontWeight="550" fontSize="0.9rem">{title}</CardHeader>
            <CardBody pt="0" p="1">
                <Stack divider={<StackDivider />} spacing='1'>
                    {children}
                </Stack>
            </CardBody>
        </Card>
    )
}

export default CardSelect


interface ItemProps {
    children: any
    selected?: boolean
    onClick?: any
}

export const CardSelectItem = ({ children,selected=false, onClick }:ItemProps) => {
    return (
        <Box className={`hover-bg ${selected ? 'highlight-bg' : ''}`} p="1" cursor="pointer" onClick={onClick}>
            {children}
        </Box>)
}