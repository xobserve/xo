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

import { Box, HStack, Input, Text, VStack,Button } from "@chakra-ui/react"
import { ColorPicker } from "components/ColorPicker"
import { EditorNumberItem } from "components/editor/EditorItem"
import RadionButtons from "components/RadioButtons"
import { cloneDeep } from "lodash"
import React, { useEffect, useState } from "react"
import { FaPlus, FaTimes } from "react-icons/fa"
import { ThresholdsConfig, ThresholdsMode } from "types/threshold"
import { colors } from "utils/colors"
import { isEmpty } from "utils/validate"

interface Props {
    value: ThresholdsConfig
    onChange: any
}


const ThresholdEditor = (props: Props) => {
    const [value, setValue] = useState(props.value)
    useEffect(() => {
        if (isEmpty(value)) {
            const v = {
                mode: ThresholdsMode.Absolute,
                thresholds: []
            }
            // add base threshold
            const color = colors[0]
            v.thresholds.push({
                color,
                value: null
            })
            setValue(v)
            props.onChange(v)
        }
    }, [])

    const addThreshod = () => {
        const color = colors[value.thresholds.length % colors.length]
        const v = value.thresholds.length > 1 ? value.thresholds[0].value + 10 : 10
        value.thresholds.unshift({
            value: v,
            color: color
        })
        changeValue(value)
    }

    const removeThreshold = (i) => {
        value.thresholds.splice(i, 1)
        changeValue(value)
    }

    const sortThresholds = (v:ThresholdsConfig) => {
        v.thresholds.sort((a, b) => {
            if (a.value === null) {
                return 1
            }
            if (b.value === null) {
                return -1
            }
            return b.value - a.value
        })
    }

    const changeValue = v => {
        sortThresholds(v)
        const v1 = cloneDeep(v)

        setValue(v1)
        props.onChange(v1)
    }

    console.log("here444444:", value)
    return (<Box>
        <Button onClick={addThreshod} width="100%" size="sm" colorScheme="gray">+ Add threshold</Button>
        <VStack alignItems="left" mt="2" key={value?.thresholds?.length}>
            {value?.thresholds?.map((threshold, i) => <HStack key={threshold.color} spacing={1}>
                <ColorPicker presetColors={colors} color={threshold.color} onChange={v =>  {
                     value.thresholds[i].color = v.hex
                    changeValue(value)
                }
                } circlePicker />
                {threshold.value === null ? <Text pl="1" fontSize="0.95rem">Base</Text> : <>{value.mode == ThresholdsMode.Percentage && <Text fontSize="0.8rem" textStyle="annotation">%</Text>}
                <EditorNumberItem value={threshold.value} onChange={v => {
                    value.thresholds[i].value = v
                    changeValue(value)
                }} /></>}

                {threshold.value !== null && <FaTimes opacity={0.6} fontSize="0.8rem" onClick={() => removeThreshold(i)} />}
            </HStack>)}
        </VStack>
        <Box mt="2">
            <Text fontSize="0.8rem">Thresholds mode</Text>
            <Text fontSize="0.8rem" textStyle="annotation"> Percentage means thresholds relative to min & max</Text>
            <RadionButtons size="sm" value={value.mode} options={[{label: "Absolute", value: ThresholdsMode.Absolute},{label: "Percentage", value:ThresholdsMode.Percentage}]} onChange={v => {
                value.mode = v
                changeValue(value)
            }}/>
        </Box>
    </Box>)
}

export default ThresholdEditor