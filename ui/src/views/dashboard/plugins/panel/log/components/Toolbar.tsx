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

import { Box, Button, Divider, HStack, Input, Text, VStack } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import React, { memo, useMemo, useState } from "react"
import { AiOutlineDoubleRight } from "react-icons/ai"
import { Panel } from "types/dashboard"
import { LogSeries } from "types/plugins/log"
import { paletteColorNameToHex } from "utils/colors"

interface Props {
    data: LogSeries[]
    panel: Panel
    onCollapseAll: any
    onSearchChange: any
    height: number
}
interface Label {
    name: string
    value: string
    count: number
}

const LogToolbar = memo((props: Props) => {
    const [search, setSearch] = useState<string>("")
    const { data, panel, onCollapseAll, onSearchChange,height } = props
    const labels = useMemo(() => {
        const result: Label[] = []
        for (const series of data) {
            const ls = series.labels
            const count = series.values.length
            for (const k of Object.keys(ls)) {
                const l = result.find(r => r.name == k && r.value == ls[k])
                if (!l) {
                    result.push({ name: k, value: ls[k], count: count })
                } else {
                    l.count += count
                }
            }
        }
        return result
    }, [data])

    const options = panel.plugins.log
    return (<Box>
        <HStack spacing={2} px="1">
            <AiOutlineDoubleRight cursor="pointer" style={{
                transform: 'rotate(90deg)'
            }} onClick={() => onCollapseAll(false)} />
            <AiOutlineDoubleRight cursor="pointer" onClick={() => onCollapseAll(true)} />
        </HStack>

        <Divider mt="2" />

        <Box fontSize="0.9rem" mt="2" px="1">
            <Text mb="1">Search logs</Text>
            <EditorInputItem value={search} onChange={v => { setSearch(v); onSearchChange(v) }} placeholder="textA || textB , A && B" />
        </Box>

        <Divider mt="3" />

        <Box px="1" mt="2">
            <Text mb="1" fontSize="0.9rem">Label filter</Text>
            <VStack alignItems="left" maxHeight={`${height-140}px`} overflowY="scroll">
                {
                    labels.map(label =>
                        <Box fontSize="0.8rem" className="bordered" cursor="pointer" px="2" py="6px">
                            <Text color={paletteColorNameToHex(options.styles.labelColor)}>{label.name}</Text>
                            <HStack>
                                <Text  color={paletteColorNameToHex(options.styles.labelValueColor)}>{label.value}</Text>
                                <Text> ({label.count})</Text>
                            </HStack>
                        </Box>)
                }

            </VStack>
        </Box>

    </Box>)
})

export default LogToolbar