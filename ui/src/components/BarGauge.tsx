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

import { Box, Flex, HStack, Text } from "@chakra-ui/react"
import React from "react"
import { Units } from "types/panel/plugins"
import { ThresholdsConfig } from "types/threshold"
import { measureText } from "utils/measureText"
import { getThreshold } from "./Threshold/utils"
import { alpha } from "./uPlot/colorManipulator"

interface Props {
    data: BarGaugeValue[]
    titleSize?: number
    textSize?: number
    threshods: ThresholdsConfig
    mode?: "basic"| "lcd"
    orientation? : "horizontal" | "vertical"
}

interface BarGaugeValue { 
    title?: string
    value: number
    max: number
    color: string
    text: string
    width: number
}

const BarGauge = ({ data, threshods, orientation="horizontal", mode="basic", titleSize=20,textSize=16 }: Props) => {
    const textWidth = Math.max(...data.map(v => v.width))
    return (<>
    {
        data.map((v, i) => {
            const metrics = measureText(v.title,titleSize,500)
            const titleHeight =  metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent; 
            const threshold = getThreshold(v.value, threshods, v.max)
            const color = threshold?.color ?? v.color
            return <Box key={v.text}  pt="5px" height={`${100 / data.length}%`}>
                {v.title && <Box height={`${titleHeight}px`}><Text fontSize={`${titleSize}px`} fontWeight={500}>{v.title}</Text></Box>}
                <Flex justifyContent="space-between" alignItems="center" width="100%" className="label-bg" height={`calc(100% - ${titleHeight}px)`} borderRadius="4px">
                    <Box width={`calc(100% - ${textWidth}px - 20px)`} position="relative" height="100%"  >
                        <Box bg={alpha(color,0.4)} width={`${v.value * 100 / v.max}%` } height="100%" borderRadius="4px" borderRight={`2px solid ${color}`}></Box>
                    </Box>
                    <Text width={textWidth} maxW="40%" fontSize={`${textSize}px`} color={color}>{v.text}</Text>
                </Flex>
            </Box>
        })
    }
    </>)
}

export default BarGauge