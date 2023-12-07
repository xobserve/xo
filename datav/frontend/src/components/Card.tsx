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

import React from 'react'
import { Box, BoxProps, Flex, useColorModeValue } from '@chakra-ui/react'

interface Props {
  shadowed?: boolean
}

const Card = (props: BoxProps & Props) => {
  const {
    shadowed,
    bg = useColorModeValue('transparent', 'transparent'),
    ...rest
  } = props
  return (
    <Box
      bg={bg}
      borderRadius='.5rem'
      borderWidth='0px'
      p={[2, 2, 4, 4]}
      boxShadow={shadowed ? '0 1px 1px 0 rgb(0 0 0 / 5%)' : null}
      height='fit-content'
      {...rest}
    />
  )
}

export default Card

export const CardHeader = (props) => {
  return (
    <Flex
      px='4'
      py='4'
      justifyContent='space-between'
      alignItems='center'
      {...props}
    />
  )
}

export const CardBody = (props) => {
  return <Box px='4' py='2' {...props} />
}
