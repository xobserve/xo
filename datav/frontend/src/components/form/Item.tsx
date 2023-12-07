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
  Box,
  Flex,
  HStack,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  StyleProps,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import React from 'react'

interface Props {
  title: any
  children?: any
  labelWidth?: string
  desc?: any
  px?: number | string
  colorSchema?: 'gray' | 'brand'
  size?: 'sm' | 'md' | 'lg'
  spacing?: number
  alignItems?: string
  onLabelClick?: any
}

const FormItem = ({
  title,
  children,
  labelWidth = 'fit-content',
  desc = null,
  px = 3,
  colorSchema = 'gray',
  size = 'md',
  spacing = 2,
  alignItems = 'top',
  onLabelClick,
  flexDirection = 'row',
  ...rest
}: Props & StyleProps) => {
  return (
    <Flex
      alignItems={alignItems}
      gap={spacing}
      flexDirection={flexDirection}
      {...rest}
    >
      <HStack
        pos='relative'
        alignItems='center'
        height={`${
          size == 'md'
            ? 'var(--chakra-sizes-10)'
            : size == 'sm'
            ? 'var(--chakra-sizes-8)'
            : 'var(--chakra-sizes-12)'
        }`}
        px={px}
        minWidth='fit-content'
        className={colorSchema == 'gray' ? 'label-bg' : 'tag-bg'}
        borderRadius='1px'
        fontSize={size == 'sm' ? '0.9rem' : '1rem'}
      >
        {typeof title == 'string' ? (
          <Text
            width={labelWidth}
            className='form-item-label'
            onClick={onLabelClick}
            cursor={onLabelClick && 'pointer'}
          >
            {title}
          </Text>
        ) : (
          <Box width={labelWidth} className='form-item-label'>
            {title}
          </Box>
        )}
        {desc &&
          (typeof desc == 'string' ? (
            <Tooltip label={desc}>
              <Box position={'absolute'} right='2'>
                <IoMdInformationCircleOutline />
              </Box>
            </Tooltip>
          ) : (
            <Popover trigger='hover'>
              <PopoverTrigger>
                <Box position={'absolute'} right='2'>
                  <IoMdInformationCircleOutline />
                </Box>
              </PopoverTrigger>
              <PopoverContent minWidth='fit-content'>
                <PopoverArrow />
                {desc}
              </PopoverContent>
            </Popover>
          ))}
      </HStack>
      {children}
    </Flex>
  )
}

export default FormItem
