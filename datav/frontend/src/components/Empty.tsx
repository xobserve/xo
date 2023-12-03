// Copyright 2023 xObserve.io Team

import React from 'react'
import { Image, Text, VStack } from '@chakra-ui/react'

const Empty = () => {
  return (
    <VStack spacing='16' py='16'>
      <Text fontSize='1.2rem'>Moommm..It seems there are nothing here ..</Text>
      <Image src='/empty.svg' height='260px' />
    </VStack>
  )
}

export default Empty
