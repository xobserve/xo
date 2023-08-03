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

import { Box, Button, Divider, HStack, Input, Text } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import React, { memo, useState } from "react"
import { AiOutlineDoubleRight } from "react-icons/ai"
import { Panel } from "types/dashboard"
import { LogSeries } from "types/plugins/log"

interface Props {
    data: LogSeries[]
    panel: Panel
    onCollapseAll: any
    onSearchChange: any
}
const LogToolbar = memo((props: Props) => {
    const [search, setSearch] = useState<string>("")
    const { data, panel, onCollapseAll, onSearchChange } = props
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

    </Box>)
})

export default LogToolbar