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

import React, { useState } from "react";
import { Box, Flex, StackDivider, VStack } from "@chakra-ui/react"
import { PanelProps } from "types/dashboard"
import { LogSeries } from "types/plugins/log";
import LogItem from "./components/LogItem";
import CollapseIcon from "components/icons/Collapse";
import { FaFilter } from "react-icons/fa";



interface LogPanelProps extends PanelProps {
    data: LogSeries[][]
}

const LogPanel = (props: LogPanelProps) => {
    const { panel } = props
    const [toolbarOpen, setToolbarOpen] = useState(false)
    const data: LogSeries[] = props.data.flat()
    if (data.length === 0) {
        return
    }
    console.log("here333333", data)
    return (<Flex position="relative">
        {panel.plugins.log.toolbar.show &&
            <Box position="absolute" right="2" top="0" onClick={() => setToolbarOpen(!toolbarOpen)} fontSize="0.7rem" opacity="0.6" cursor="pointer" p="2px" className="color-text">
                <FaFilter />
            </Box>}
        <VStack alignItems="left" divider={<StackDivider />} py="2" width={props.width - (toolbarOpen ? panel.plugins.log.toolbar.width : 1)} transition="all 0.3s">
            {
                data[0].values.map(log => <LogItem log={log} labels={data[0].labels} panel={props.panel} />)
            }
        </VStack>
        {<Box className="bordered-left" width={toolbarOpen ? panel.plugins.log.toolbar.width : 0} transition="all 0.3s">

        </Box>}
    </Flex>)
}

export default LogPanel


