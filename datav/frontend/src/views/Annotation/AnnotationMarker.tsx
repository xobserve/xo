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
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react'
import React from 'react'
import { FaEdit, FaTrashAlt } from 'react-icons/fa'
import { Annotation } from 'types/annotation'
import { durationToSeconds } from 'utils/date'
import { dateTimeFormat } from 'utils/datetime/formatter'
import ColorTag from 'src/components/ColorTag'
import { isEmpty } from 'utils/validate'
import { paletteColorNameToHex } from 'utils/colors'

interface Props {
  annotation: Annotation
  width: number
  onEditAnnotation: any
  onRemoveAnnotation: any
}
const MIN_REGION_ANNOTATION_WIDTH = 6
const AnnotationMarker = ({
  annotation,
  width,
  onEditAnnotation,
  onRemoveAnnotation,
}: Props) => {
  const { colorMode } = useColorMode()
  const isRegionAnnotation = width > MIN_REGION_ANNOTATION_WIDTH
  let left = `${width / 2}px`
  // console.log("here3333333:",annotation,width)

  return (
    <Popover trigger='hover' openDelay={10} closeDelay={500}>
      <PopoverTrigger>
        <Box cursor='pointer' className='annotation-marker'>
          {!isRegionAnnotation ? (
            <div
              style={{
                left,
                position: 'relative',
                transform: 'translate3d(-50%,-50%, 0)',
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderBottom: `4px solid ${paletteColorNameToHex(
                  annotation.color,
                  colorMode,
                )}`,
              }}
            />
          ) : (
            <div
              style={{
                width: `${width}px`,
                height: '5px',
                transform: 'translate3d(0%,-50%, 0)',
                // borderLeft: '4px solid transparent',
                // borderRight: '4px solid transparent',
                background: paletteColorNameToHex(annotation.color, colorMode),
              }}
            />
          )}
        </Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent minWidth='350px' p='0'>
          <PopoverArrow />
          <PopoverBody p='0'>
            <Flex
              justifyContent='space-between'
              alignItems='center'
              fontSize='0.8rem'
              className='bordered-bottom'
              px='1'
            >
              {!isEmpty(annotation.namespace) ? (
                <HStack spacing={3}>
                  <VStack
                    alignItems='left'
                    spacing={1}
                    className='bordered-right'
                    px='2'
                    py='1'
                  >
                    <HStack>
                      <Text minWidth='fit-content'>
                        {dateTimeFormat(annotation.time * 1000)}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text minWidth='fit-content'>
                        {dateTimeFormat(
                          (annotation.time +
                            durationToSeconds(annotation.duration)) *
                            1000,
                        )}
                      </Text>
                    </HStack>
                  </VStack>
                  <Text className='color-text' fontWeight={550}>
                    {annotation.duration}
                  </Text>
                </HStack>
              ) : (
                <HStack spacing={2} p='2'>
                  <Text minWidth='fit-content'>
                    {dateTimeFormat(annotation.time * 1000)}
                  </Text>
                  <Text>-</Text>
                  <Text minWidth='fit-content'>
                    {dateTimeFormat(
                      (annotation.time +
                        durationToSeconds(annotation.duration)) *
                        1000,
                    )}
                  </Text>
                </HStack>
              )}
              {!isEmpty(annotation.namespace) && (
                <HStack spacing={3} className='action-icon'>
                  <FaEdit cursor='pointer' onClick={onEditAnnotation} />
                  <FaTrashAlt cursor='pointer' onClick={onRemoveAnnotation} />
                </HStack>
              )}
            </Flex>
            <Text fontSize='0.9rem' px='4' py='1'>
              {annotation.text}
            </Text>
            <HStack width='100%' px='3' py='1' spacing={1}>
              {annotation.tags.map((t) => (
                <ColorTag name={t} />
              ))}
            </HStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

export default AnnotationMarker
