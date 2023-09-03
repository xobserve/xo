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
import MultiRadionButtons from "components/MultiRadioButtons"
import RadionButtons from "components/RadioButtons"
import { EditorInputItem } from "components/editor/EditorItem"
import React, { memo, useState } from "react"
import { AiOutlineDoubleRight } from "react-icons/ai"
import { MobileVerticalBreakpointNum } from "src/data/constants"
import { AlertState } from "types/alert"
import { Panel } from "types/dashboard"
import { AlertToolbarOptions } from "types/plugins/alert"

interface Props {
    active: string[]
    labels: string[]
    panel: Panel
    height: number
    onCollapseAll: any
    onSearchChange: any
    onActiveLabel: any
    rulesCount: number
    alertsCount: number
    onViewLogChange: any
    viewOptions: AlertToolbarOptions
    width: number
}


const AlertToolbar = memo((props: Props) => {
    const { panel, onCollapseAll, onSearchChange, rulesCount,alertsCount, viewOptions, onViewLogChange,width } = props
    const [search, setSearch] = useState<string>("")

    // const options = panel.plugins.log

    return (<Box>
        <Flex justifyContent="space-between" pl="1" pr="5" pt="1" fontSize="0.85rem" >
            <HStack spacing={1}>
                <AiOutlineDoubleRight cursor="pointer" style={{
                    transform: 'rotate(90deg)'
                }} onClick={() => onCollapseAll(false)} />
                <AiOutlineDoubleRight cursor="pointer" onClick={() => onCollapseAll(true)} />
            </HStack>
            <HStack spacing={1}>
                {width > MobileVerticalBreakpointNum && <>
                <Text className="color-text">{rulesCount}</Text>
                <Text opacity="0.7">Rules</Text>
                </>}
                <Text className="color-text">{alertsCount}</Text>
                <Text opacity="0.7">Alerts</Text>
            </HStack>
            <Box></Box>
        </Flex>

        <Divider mt="" />

        <Box fontSize="0.8rem" mt="2" px="1">
            <Text mb="1">Search everthing</Text>
            <EditorInputItem value={search} onChange={v => { setSearch(v); onSearchChange(v) }} placeholder="support regex" />
        </Box>

        <Divider mt="3" />
        <VStack alignItems="left" fontSize="0.8rem" mt="2" px="2" spacing={2}>
            <Box >
                <Text mb="2">View mode</Text>
                <RadionButtons size="xs" options={[{ label: "List", value: "list" }, { label: "Stat", value: "stat" }]} value={viewOptions.viewMode} onChange={v => onViewLogChange({ ...viewOptions, viewMode: v })} />
            </Box>
            <Box>
                <Text mb="2">Bar type</Text>
                <RadionButtons size="xs" options={[{ label: "Total", value: "total" }, { label: "Labels", value: 'labels' }]} value={viewOptions.barType} onChange={v => onViewLogChange({ ...viewOptions, barType: v })} />
            </Box>
            <Box>
                <Text  mb="2">Rule name filter</Text>
                <EditorInputItem value={viewOptions.ruleNameFilter}  onChange={v => onViewLogChange({ ...viewOptions, ruleNameFilter: v })} placeholder="support multi regex" />
            </Box>
            <Box>
                <Text  mb="2">Rule label filter</Text>
                <EditorInputItem value={viewOptions.ruleLabelsFilter}  onChange={v => onViewLogChange({ ...viewOptions, ruleLabelsFilter: v })} placeholder={`{severity="critical"}`} />
            </Box>
            <Box>
                <Text  mb="2">Alert label filter</Text>
                <EditorInputItem value={viewOptions.labelNameFilter}  onChange={v => onViewLogChange({ ...viewOptions, labelNameFilter: v })} placeholder={`{service="api-gateway", instance=~"cluster-cn-.+"}`} />
            </Box>
            <Box>
                <Text  mb="2">State filter</Text>
                <MultiRadionButtons size="xs" options={Object.keys(AlertState).map(k => ({ label: AlertState[k], value: AlertState[k] }))} value={viewOptions.stateFilter}  onChange={v => onViewLogChange({ ...viewOptions, stateFilter: v })}/>
            </Box>
        </VStack>
        <Divider mt="4" />
        <HStack mt="4" px="2">
            <Text fontSize="0.8rem">Persist options</Text>
            <Checkbox isChecked={viewOptions.persist} onChange={e => onViewLogChange({ ...viewOptions, persist: e.currentTarget.checked})}/>
        </HStack>
    </Box>)
})

export default AlertToolbar