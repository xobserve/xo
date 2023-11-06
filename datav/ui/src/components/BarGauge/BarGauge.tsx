// Copyright 2023 xObserve.io Team
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

import { Box, Flex, HStack, Text, useColorMode, useColorModeValue, useToast, VStack } from "@chakra-ui/react"
import { formatUnit } from "src/views/dashboard/plugins/components/UnitPicker"
import React from "react"
import { Unit } from "types/panel/plugins"
import { ThresholdsConfig } from "types/threshold"
import { paletteColorNameToHex } from "utils/colors"
import { measureText } from "utils/measureText"
import { getThreshold } from "../../views/dashboard/plugins/components/Threshold/utils"
import { alpha } from "../uPlot/colorManipulator"
import { commonInteractionEvent, genDynamicFunction } from "utils/dashboard/dynamicCall"
import { isFunction } from "lodash"
import CustomScrollbar from "src/components/CustomScrollbar/CustomScrollbar"

interface Props {
    data: BarGaugeValue[]
    textWidth: number
    threshods?: ThresholdsConfig
    titleSize?: number
    textSize?: number | string
    mode?: "basic" | "lcd"
    orientation?: "horizontal" | "vertical"
    borderRadius?: string
    showUnfilled?: boolean
    fillOpacity?: number
    width?: number
    height?: number
    showMax?: boolean
    showMin?: boolean
    onClick?: string
}

export interface BarGaugeValue {
    title?: string // for display
    rawTitle?: string  // for index
    value: number
    min?: number
    max: number
    color?: string
    disableOverrideColor?: boolean
    text: string
    thresholds?: ThresholdsConfig
    units?: Unit[]
    decimal?: number
}

const lcdCellWidth = 12
const lcdCellSpacing = 2
const minMaxHeight = 15
const BarGauge = (props: Props) => {

    const { colorMode } = useColorMode()
    const toast = useToast()
    const { data, width, height, orientation = "horizontal", mode = "basic", titleSize = 18, textSize = 16, borderRadius = "4px", showUnfilled = true, fillOpacity = 0.6, showMax = false, showMin = false } = props
    const Stack = orientation == "horizontal" ? VStack : HStack
    // add a margin left for text width
    const textWidth = props.textWidth ? props.textWidth + 5 : 0
    return (<Box position="relative" width="100%" height="100%">
        <Stack alignItems={orientation == "horizontal" ? "left" : "top"} position="absolute" top="0" left="0" right="0" bottom="0">
            {
                data.map((v, i) => {
                    if (!v.min) {
                        v.min = 0
                    }

                    const metrics = measureText(v.title, titleSize, 500)
                    const titleHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
                    const lcdSize = orientation == "horizontal" ? width - textWidth - 20 : height - titleHeight - 20 - ((showMin || showMax) ? minMaxHeight : 0)
                    const lcdCellCount = Math.floor(lcdSize / lcdCellWidth!);
                    const lcdCellSize = Math.floor((lcdSize - lcdCellSpacing * lcdCellCount) / lcdCellCount);
                    const gap = lcdSize - (lcdCellCount * (lcdCellSize + lcdCellSpacing)) + 1
                    const thresholds = v.thresholds ?? props.threshods
                    const threshold = getThreshold(v.value, thresholds, v.max)
                    let color
                    if (v.disableOverrideColor) {
                        color = v.color
                    } else {
                        color = threshold?.color ?? v.color
                    }

                    color = paletteColorNameToHex(color, colorMode)


                    const onClick = props.onClick ? () => {
                        const onClick = genDynamicFunction(props.onClick);
                        if (isFunction(onClick)) {
                            const tData = commonInteractionEvent(onClick, v)
                            return tData
                        } else {
                            toast({
                                title: "Invalid click action",
                                status: "warning",
                                duration: 3000,
                                isClosable: true,
                            })
                        }
                    } : null
                    if (orientation == "horizontal") {
                        return <Box key={i} height={`${100 / data.length}%`} width="99%" onClick={onClick} cursor={onClick ? "pointer" : null}>
                            {
                                <> {v.title && <Box height={`${titleHeight}px`}><Text fontSize={`${titleSize}px`} fontWeight={500} noOfLines={1}>{v.title}</Text></Box>}
                                    <Flex justifyContent="space-between" alignItems="center" width="100%" height={v.title ? `calc(100% - ${titleHeight}px)` : '100%'} borderRadius={borderRadius}>
                                        <Box width={`calc(100% - ${textWidth}px - 20px)`} position="relative" height="100%" bg={showUnfilled ? useColorModeValue("rgb(244, 245, 245)", "rgba(255,255,255,0.1)") : null}>
                                            {mode == "lcd" ?
                                                <HStack spacing={`${lcdCellSpacing}px`} height="100%">
                                                    {
                                                        Array.from({ length: lcdCellCount }, (_, i) => {
                                                            let color
                                                            if (v.disableOverrideColor) {
                                                                color = v.color
                                                            } else {
                                                                const threshold = getThreshold(v.min + ((i + 1) / lcdCellCount) * (v.max - v.min), thresholds, v.max)
                                                                color = threshold?.color ?? v.color
                                                            }

                                                            color = paletteColorNameToHex(color, colorMode)
                                                            const cellColor = i < Math.floor((v.value - v.min) * lcdCellCount / (v.max - v.min)) ? `radial-gradient(${alpha(color, 0.95)} 10%, ${alpha(color, 0.55)} )` : alpha(color, 0.25);
                                                            return <Box key={i} width={`${lcdCellSize}px`} height="100%" bg={cellColor} borderRadius="2px"></Box>
                                                        })
                                                    }
                                                </HStack>
                                                :
                                                <Box bg={color == "transparent" ? color : alpha(color, fillOpacity)} width={`${Math.min((v.value - v.min) * 100 / (v.max - v.min), 100)}%`} height="100%" borderRadius={borderRadius} borderRight={`2px solid ${color}`}></Box>}
                                        </Box>
                                        <Box width={textWidth} maxW="40%">
                                            {showMin && <Text fontSize="0.6rem" opacity="0.4">{`${formatUnit(v.min, v.units, v.decimal)}`}</Text>}
                                            <Text fontSize={`${textSize}px`} color={color}>{v.text}</Text>
                                            {showMax && <Text fontSize="0.6rem" opacity="0.4">{`${formatUnit(v.max, v.units, v.decimal)}`}</Text>}
                                        </Box>
                                    </Flex>
                                </>
                            }
                        </Box>
                    } else {
                        return <CustomScrollbar hideHorizontalTrack><Box width={`${width / data.length - 6}px`} maxH={height} textAlign="center" onClick={onClick} cursor={onClick ? "pointer" : null}>
                            <Text lineHeight={`${titleHeight}px`} fontSize={`${textSize}px`} color={color} noOfLines={1}>{v.text}</Text>
                            <Box height={lcdSize - gap} width="100%" bg={showUnfilled ? useColorModeValue("rgb(244, 245, 245)", "rgba(255,255,255,0.1)") : null} position="relative">
                                {mode == "lcd" ?
                                    <VStack width="100%" height={lcdSize} alignItems="left">
                                        {
                                            Array.from({ length: lcdCellCount }, (_, i) => {
                                                let color
                                                if (v.disableOverrideColor) {
                                                    color = v.color
                                                } else {
                                                    const threshold = getThreshold(v.min + ((i + 1) / lcdCellCount) * (v.max - v.min), thresholds, v.max)
                                                    color = threshold.color
                                                }
                                                color = paletteColorNameToHex(threshold.color, colorMode)
                                                const cellColor = i < Math.floor((v.value - v.min) * lcdCellCount / (v.max - v.min)) ? `radial-gradient(${alpha(color, 0.95)} 10%, ${alpha(color, 0.55)} )` : alpha(color, 0.2);
                                                return <Box position="absolute" bottom={`${(i) * (lcdCellSize + lcdCellSpacing)}px`} key={i} height={`${lcdCellSize}px`} width="100%" bg={cellColor} borderRadius="2px"></Box>
                                            })
                                        }
                                    </VStack>
                                    :
                                    <Box position="absolute" bottom="0" bg={color == "transparent" ? color : alpha(color, fillOpacity)} height={`${(v.value - v.min) * 100 / (v.max - v.min)}%`} width="100%" borderRadius={borderRadius} borderTop={`2px solid ${color}`}></Box>}
                            </Box>
                            <Flex justifyContent="space-between" alignItems="center">
                                {showMin ? <Text fontSize="0.6rem" opacity="0.4">{`${formatUnit(v.min, v.units, v.decimal)}`} </Text> : <Box></Box>}
                                {showMax ? <Text fontSize="0.6rem" opacity="0.4"> {`${formatUnit(v.max, v.units, v.decimal)}`}</Text> : <Box></Box>}
                            </Flex>
                            {v.title && <Box><Text fontSize={`${titleSize}px`} fontWeight={500} wordBreak={"break-all"}>{v.title}</Text></Box>}
                        </Box>
                        </CustomScrollbar>
                    }

                })
            }
        </Stack>
    </Box>)
}

export default BarGauge