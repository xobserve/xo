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
import { Alert, AlertDescription, AlertIcon, AlertStatus, AlertTitle, Box, Divider, Text } from "@chakra-ui/react"
import React from "react"

interface Props {
    status: AlertStatus
    title: string
    children: any
}

export const DetailAlert = ({ status, title, children }: Props) => {
    return (
        <Alert
            status={status}
            variant='subtle'
            flexDirection='column'
            alignItems='left'
            justifyContent='center'
            width="fit-content"
        >
            <AlertIcon boxSize='40px' mr={0} />
            <AlertTitle mt={4} mb={4} fontSize='lg'>
                {title}
            </AlertTitle>
            <Divider />
            <Box mt="3" pb="1">
            {children}
            </Box>

        </Alert>
    )
}


interface Detail {
    title?: string
    children: any
}

export const DetailAlertItem = ({ title, children }: Detail) => {
    return (<AlertDescription mt="4">
        {title && <Box textStyle="subTitle">{title}</Box>}
            {children}
    </AlertDescription>)
}
