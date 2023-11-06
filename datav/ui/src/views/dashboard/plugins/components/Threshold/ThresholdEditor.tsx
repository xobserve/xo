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

import { Box, HStack, Input, Text, VStack, Button, Switch } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import { ColorPicker } from "src/components/ColorPicker"
import { EditorNumberItem } from "src/components/editor/EditorItem"
import RadionButtons from "src/components/RadioButtons"
import { cloneDeep } from "lodash"
import React, { useState } from "react"
import { FaTimes } from "react-icons/fa"
import { componentsMsg } from "src/i18n/locales/en"
import { ThresholdsConfig, ThresholdsMode } from "types/threshold"
import { palettes } from "utils/colors"
import { isEmpty } from "utils/validate"
import { CodeEditorModal } from "components/CodeEditor/CodeEditorModal"

interface Props {
    value: ThresholdsConfig
    onChange: any
    enableTransform?: boolean
}

export const thresholdTransform = `function transform(data, lodash){

}`
const ThresholdEditor = (props: Props) => {
    const t1 = useStore(componentsMsg)
    const [value, setValue] = useState(props.value)
    if (isEmpty(value)) {
        const v = {
            mode: ThresholdsMode.Absolute,
            thresholds: [],
            enableTransform: false,
            transform: thresholdTransform,
        }
        // add base threshold
        const color = palettes[0]
        v.thresholds.push({
            color,
            value: null
        })
        setValue(v)
        return
    }

    const changeValue = v => {
        sortThresholds(v)
        const v1 = cloneDeep(v)

        setValue(v1)
        props.onChange(v1)
    }


    if (isEmpty(value.transform)) {
        value.transform = thresholdTransform
        changeValue(value)
        return
    }
    const addThreshod = () => {
        const color = palettes[value.thresholds.length % palettes.length]
        const v = value.thresholds.length > 1 ? value.thresholds[0].value : 0
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

    const sortThresholds = (v: ThresholdsConfig) => {
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

    return (<Box>
        <Button onClick={addThreshod} width="100%" size="sm" colorScheme="gray">+ {t1.addThreshold}</Button>
        <Text fontSize="0.8rem" textStyle="annotation" mt="2">{t1.thresholdTips}</Text>
        <VStack alignItems="left" mt="2">
            {value?.thresholds?.map((threshold, i) => <HStack key={threshold.color + threshold.value + i} spacing={1}>
                <ColorPicker color={threshold.color} onChange={v => {
                    value.thresholds[i].color = v
                    changeValue(value)
                }
                } circlePicker />
                {threshold.value === null ? <Text pl="1" fontSize="0.95rem">Base</Text> : <>{value.mode == ThresholdsMode.Percentage && <Text fontSize="0.8rem" textStyle="annotation">%</Text>}
                    <EditorNumberItem value={threshold.value} onChange={v => {
                        value.thresholds[i].value = v
                        changeValue(value)
                    }} notNull /></>}

                {threshold.value !== null && <FaTimes opacity={0.6} fontSize="0.8rem" onClick={() => removeThreshold(i)} />}
            </HStack>)}
        </VStack>
        <Box mt="2">
            <Text fontSize="0.8rem">{t1.thresholdMode}</Text>
            <Text fontSize="0.8rem" textStyle="annotation"> {t1.thresholdModeTips} </Text>
            <RadionButtons size="sm" value={value.mode} options={[{ label: t1[ThresholdsMode.Absolute], value: ThresholdsMode.Absolute }, { label: t1[ThresholdsMode.Percentage], value: ThresholdsMode.Percentage }]} onChange={v => {
                value.mode = v
                changeValue(value)
            }} />
        </Box>
        {props.enableTransform && <>
            <Box mt="2">
                <Text fontSize="0.8rem">{t1.valueTransform}</Text>
                <Text fontSize="0.8rem" textStyle="annotation"> {t1.valueTransformTips} </Text>
                <Switch isChecked={value.enableTransform} onChange={e => {
                    value.enableTransform = e.currentTarget.checked
                    changeValue(value)
                }} />
            </Box>
            {value.enableTransform && <Box mt="2">
                <Text fontSize="0.8rem" mb="1">{t1.valueTransform}</Text>
                <CodeEditorModal value={value.transform} onChange={v => {
                    value.transform = v
                    changeValue(value)
                }} />
            </Box>}
        </>}
    </Box>)
}

export default ThresholdEditor