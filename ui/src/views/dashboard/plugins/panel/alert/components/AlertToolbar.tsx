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

import { Box, Button, Checkbox, Divider, Flex, HStack, Input, Text, VStack } from "@chakra-ui/react"
import RadionButtons from "components/RadioButtons"
import { EditorInputItem, EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem"
import React, { memo, useEffect, useMemo, useState } from "react"
import { AiOutlineDoubleRight } from "react-icons/ai"
import { Panel } from "types/dashboard"
import { AlertToolbarOptions } from "types/plugins/alert"
import { LogChartView, LogLabel, LogSeries } from "types/plugins/log"
import { paletteColorNameToHex } from "utils/colors"

interface Props {
    active: string[]
    labels: string[]
    panel: Panel
    height: number
    onCollapseAll: any
    onSearchChange: any
    onActiveLabel: any
    currentCount: number
    onViewLogChange: any
    viewOptions: AlertToolbarOptions
}


const AlertToolbar = memo((props: Props) => {
    const { panel, onCollapseAll, onSearchChange, currentCount, viewOptions, onViewLogChange } = props
    const [search, setSearch] = useState<string>("")

    const options = panel.plugins.log

    return (<Box>
        <Flex justifyContent="space-between" pl="1" pr="5" fontSize="0.85rem" mt="-3px">
            <HStack spacing={1}>
                <AiOutlineDoubleRight cursor="pointer" style={{
                    transform: 'rotate(90deg)'
                }} onClick={() => onCollapseAll(false)} />
                <AiOutlineDoubleRight cursor="pointer" onClick={() => onCollapseAll(true)} />
            </HStack>
            <HStack spacing={1}>
                <Text className="color-text">{currentCount}</Text>
                <Text opacity="0.7">Rules</Text>
            </HStack>
            <Box></Box>
        </Flex>

        <Divider mt="" />

        <Box fontSize="0.8rem" mt="2" px="1">
            <Text mb="1" fontWeight="500">Search logs</Text>
            <EditorInputItem value={search} onChange={v => { setSearch(v); onSearchChange(v) }} placeholder="textA || textB , A && B" />
        </Box>

        <Divider mt="2" />
        <VStack alignItems="left" fontSize="0.8rem" mt="3" px="1">
            <HStack >
                <Text>View mode</Text>
                <RadionButtons size="xs" options={[{ label: "List", value: "list" }, { label: "Stat", value: "stat" }]} value={viewOptions.viewMode} onChange={v => onViewLogChange({ ...viewOptions, viewMode: v })} />
            </HStack>
            <HStack>
                <Text>Bar type</Text>
                <RadionButtons size="xs" options={[{ label: "Total", value: "total" }, { label: "Labels", value: 'labels' }]} value={viewOptions.barType} onChange={v => onViewLogChange({ ...viewOptions, barType: v })} />
            </HStack>
        </VStack>
        <Divider mt="3" />
        <HStack mt="3" px="1">
            <Text fontSize="0.8rem">Persist options</Text>
            <Checkbox isChecked={viewOptions.persist} onChange={e => onViewLogChange({ ...viewOptions, persist: e.currentTarget.checked})}/>
        </HStack>
    </Box>)
})

export default AlertToolbar