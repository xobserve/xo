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

import { Box, Button, Divider, Flex, HStack, Input, Text, VStack } from "@chakra-ui/react"
import RadionButtons from "components/RadioButtons"
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem"
import React, { memo, useEffect, useMemo, useState } from "react"
import { AiOutlineDoubleRight } from "react-icons/ai"
import { Panel } from "types/dashboard"
import { LogChartView, LogLabel, LogSeries } from "types/plugins/log"
import { paletteColorNameToHex } from "utils/colors"

interface Props {
    active: string[]
    labels: LogLabel[]
    panel: Panel
    height: number
    onCollapseAll: any
    onSearchChange: any
    onActiveLabel: any
    activeOp: "or" | "and"
    onActiveOpChange: any
    currentLogsCount: number
    onViewLogChange: any
    viewOptions: LogChartView
}


const LogToolbar = memo((props: Props) => {
    const { active, labels, panel, onCollapseAll, onSearchChange, height, onActiveLabel, activeOp, onActiveOpChange, currentLogsCount,viewOptions,onViewLogChange } = props
    const [search, setSearch] = useState<string>("")

    const options = panel.plugins.log
    return (<Box>
        <Flex justifyContent="space-between"  pl="1" pr="5" fontSize="0.85rem" mt="-3px">
            <HStack spacing={1}>
                <AiOutlineDoubleRight cursor="pointer" style={{
                    transform: 'rotate(90deg)'
                }} onClick={() => onCollapseAll(false)} />
                <AiOutlineDoubleRight cursor="pointer" onClick={() => onCollapseAll(true)} />
            </HStack>
            <HStack spacing={1}>
                 <Text className="color-text">{currentLogsCount}</Text>
                 <Text opacity="0.7">logs</Text>
                </HStack>
           <Box></Box>
        </Flex>

        <Divider mt="" />

        <Box fontSize="0.8rem" mt="2" px="1">
            <Text mb="1" fontWeight="500">Search logs</Text>
            <EditorInputItem value={search} onChange={v => { setSearch(v); onSearchChange(v) }} placeholder="textA || textB , A && B" />
        </Box>

        <Divider mt="2" />
        <Box fontSize="0.8rem" mt="3" px="1">
            <Text mb="1"fontWeight="500" >Chart options</Text>
            <Text mb="1" fontSize="0.7rem" ml="2px">Max bars count</Text>
            <EditorSliderItem  value={viewOptions.maxBars} min={15} max={100} step={1} onChange={v => { onViewLogChange({...viewOptions, maxBars: v}) }}  />
            <Text mb="1" fontSize="0.7rem" ml="2px">Bar type</Text>
                <RadionButtons size="xs" options={[{ label: "Total", value: "total" }, { label: "Labels", value: 'labels' }]} value={viewOptions.barType} onChange={v => onViewLogChange({...viewOptions, barType: v})} />
        </Box>
        <Divider mt="3" />      
        <Box px="1" mt="2">
            <Flex alignItems="center" justifyContent="space-between">
                <Text mb="1" fontSize="0.8rem" fontWeight="500">Label filter</Text>
                <Button size="xs" mt="-1" onClick={onActiveOpChange}>{activeOp.toUpperCase()}</Button>
            </Flex>
            <VStack mt="2" alignItems="left" maxHeight={`400px`} overflowY="scroll">
                {
                    labels.map(label =>
                        <Box fontSize="0.85rem" className={active.includes(label.id) ? "highlight-bordered" : "bordered"} onClick={() => onActiveLabel(label.id)} cursor="pointer" px="2" py="1">
                            <Text color={paletteColorNameToHex(options.styles.labelColor)}>{label.name}</Text>
                            <HStack>
                                <Text color={paletteColorNameToHex(options.styles.labelValueColor)}>{label.value}</Text>
                                <Text> ({label.count})</Text>
                            </HStack>
                        </Box>)
                }

            </VStack>
        </Box>

    </Box>)
})

export default LogToolbar