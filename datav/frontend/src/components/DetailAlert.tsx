// Copyright 2023 xObserve.io Team

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
      <VStack mt='1'>{children}</VStack>
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
