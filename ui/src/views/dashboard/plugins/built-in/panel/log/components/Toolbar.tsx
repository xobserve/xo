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

import { Box, Divider, Flex, HStack, Text } from "@chakra-ui/react"
import { EditorInputItem } from "src/components/editor/EditorItem"
import React, { memo, useEffect, useState } from "react"
import { AiOutlineDoubleRight } from "react-icons/ai"
import { Panel } from "types/dashboard"
import { LogChartView, LogLabel } from "src/views/dashboard/plugins/built-in/panel/log/log"
import { replaceWithVariables } from "utils/variable"
import { useStore } from "@nanostores/react"
import { $variables } from "src/views/variables/store"

interface Props {
    panel: Panel
    height: number
    onCollapseAll: any
    onSearchChange: any
    onLabelSearch: any
    currentLogsCount: number
}


const LogToolbar = memo((props: Props) => {
    const { panel, onCollapseAll, onSearchChange,onLabelSearch,  currentLogsCount } = props
    const [search, setSearch] = useState<string>(props.panel.plugins.log.search.log)
    const [labelSearch, setLabelSearch] = useState<string>(props.panel.plugins.log.search.labels)

    const vars = useStore($variables)
    useEffect(() => {
        onSearchChange(replaceWithVariables(search))
        onLabelSearch(replaceWithVariables(labelSearch))
    },[vars])
    
    return (<Box px="2">
        <Flex justifyContent="space-between" py="2"  pl="1" pr="5" fontSize="0.85rem" mt="-3px">
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
            <Text  fontWeight="500">Search log content</Text>
            <EditorInputItem value={search} onChange={v => { setSearch(v); onSearchChange(replaceWithVariables(v)) }} placeholder="textA || textB , A && B" />

            <Text mt="2" fontWeight="500">Search log labels</Text>
            <EditorInputItem value={labelSearch} onChange={v => { setLabelSearch(v); onLabelSearch(replaceWithVariables(v)) }} placeholder="labelA=valueA,labelB=valueB" />
            <Text textStyle="annotation" mt="1" fontSize="12px">support using variables</Text>
        </Box>
    </Box>)
})

export default LogToolbar