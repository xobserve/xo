// Copyright 2023 xobserve.io Team
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

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertStatus,
  AlertTitle,
  Box,
  Divider,
  Flex,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import React from 'react'

interface Props {
  status: AlertStatus
  title: string
  children: any
  width?: string
}

export const DetailAlert = ({
  status,
  title,
  children,
  width = 'fit-content',
}: Props) => {
  return (
    <Alert
      status={status}
      variant='subtle'
      flexDirection='column'
      alignItems='left'
      justifyContent='center'
      width={width}
    >
      <HStack alignItems='center' pt='1' pb='3'>
        <AlertIcon boxSize='20px' mr={0} />
        <AlertTitle fontSize='lg'>{title}</AlertTitle>
      </HStack>

      <Divider mt='1' />
      <VStack mt='1' alignItems='left'>
        {children}
      </VStack>
    </Alert>
  )
}

interface Detail {
  title?: string
  children: any
}

export const DetailAlertItem = ({ title, children }: Detail) => {
  return (
    <AlertDescription mt='4'>
      {title && <Box textStyle='subTitle'>{title}</Box>}
      {children}
    </AlertDescription>
  )
}
