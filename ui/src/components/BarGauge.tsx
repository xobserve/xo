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

import { border, Box, Flex, HStack, Text, useColorModeValue } from "@chakra-ui/react"
import React from "react"
import { Units } from "types/panel/plugins"
import { ThresholdsConfig } from "types/threshold"
import { measureText } from "utils/measureText"
import { getThreshold } from "./Threshold/utils"
import { alpha } from "./uPlot/colorManipulator"

interface Props {
    data: BarGaugeValue[]
    textWidth: number
    titleSize?: number
    textSize?: number
    threshods?: ThresholdsConfig
    mode?: "basic"| "lcd"
    orientation? : "horizontal" | "vertical"
    borderRadius?: string
    showUnfilled?: boolean
    fillOpacity?: number
    width?: number
    height?: number
}

interface BarGaugeValue { 
    title?: string
    value: number
    min?: number
    max: number
    color?: string
    text: string
}

const lcdCellWidth = 12
const lcdCellSpacing = 2
const BarGauge = ({ data,textWidth,width,height, threshods=null, orientation="horizontal", mode="lcd", titleSize=20,textSize=16,borderRadius="4px",showUnfilled=true,fillOpacity=0.6 }: Props) => {
    return (<>
    {
        data.map((v, i) => {
            const metrics = measureText(v.title,titleSize,500)
            const titleHeight =  metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent; 
            const lcdSize = orientation == "horizontal" ? width - textWidth - 20: height - titleHeight - 20
            const lcdCellCount = Math.floor(lcdSize / lcdCellWidth!);
            const lcdCellSize = Math.floor((lcdSize - lcdCellSpacing * lcdCellCount) / lcdCellCount);
            const threshold = getThreshold(v.value, threshods, v.max)
            const color = threshold?.color ?? v.color
            return <Box key={v.text}  height={`${100 / data.length}%`}>
                {v.title && <Box height={`${titleHeight}px`}><Text fontSize={`${titleSize}px`} fontWeight={500}>{v.title}</Text></Box>}
                <Flex justifyContent="space-between" alignItems="center" width="100%"  height={v.title ? `calc(100% - ${titleHeight}px)` : '100%'} borderRadius={borderRadius}>
                    <Box width={`calc(100% - ${textWidth}px - 20px)`} position="relative" height="100%"  bg={showUnfilled ? useColorModeValue("rgb(244, 245, 245)", "rgba(255,255,255,0.1)")  : null}>
                        {mode == "lcd" ?
                         <HStack spacing={`${lcdCellSpacing}px`} height="100%">
                            {
                                Array.from({ length: lcdCellCount }, (_, i) => {
                                    const threshold = getThreshold(v.min + ((i+1) / lcdCellCount) * (v.max-v.min), threshods, v.max)
                                    const cellColor = i < Math.floor((v.value-v.min) * lcdCellCount / (v.max-v.min)) ? `radial-gradient(${alpha(threshold.color,0.95)} 10%, ${alpha(threshold.color,0.55)} )` : alpha(threshold.color,0.25) ;
                                    return <Box key={i} width={`${lcdCellSize}px`} height="100%" bg={cellColor} borderRadius="2px"></Box>
                                })
                            }
                        </HStack> 
                        : 
                        <Box bg={color == "transparent" ? color : alpha(color,fillOpacity)} width={`${(v.value-v.min) * 100 / (v.max-v.min)}%` } height="100%" borderRadius={borderRadius} borderRight={`2px solid ${color}`}></Box>}
                    </Box>
                    <Text width={textWidth} maxW="40%" fontSize={`${textSize}px`} color={color}>{v.text}</Text>
                </Flex>
            </Box>
        })
    }
    </>)
}

export default BarGauge