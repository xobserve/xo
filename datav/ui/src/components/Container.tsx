// Copyright 2023 xObserve.io Team

import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'

const Container = (props: BoxProps) => (
  <Box
    w='full'
    pb='12'
    pt='3'
    maxW='1280px'
    mx='auto'
    px={[0, 0, 4, 4]}
    {...props}
  />
)

export default Container
