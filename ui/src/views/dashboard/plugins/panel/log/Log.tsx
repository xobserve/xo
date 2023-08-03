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
import { Box, HStack, StackDivider, Text, VStack } from "@chakra-ui/react"
import { Panel, PanelProps } from "types/dashboard"
import { LogSeries } from "types/plugins/log";
import { dateTimeFormat } from "utils/datetime/formatter";
import { toNumber } from "lodash";
import CollapseIcon from "components/icons/Collapse";
import { LayoutOrientation } from "types/layout";


interface LogPanelProps extends PanelProps {
    data: LogSeries[][]
}

const LogPanel = (props: LogPanelProps) => {
    const data: LogSeries[] = props.data.flat()
    if (data.length === 0) {
        return
    }
    console.log("here333333", data)
    return (<VStack alignItems="left" divider={<StackDivider />} py="2" >
        {
            data[0].values.map(log => <LogItem log={log} labels={data[0].labels} panel={props.panel} />)
        }
    </VStack >)
}

export default LogPanel


interface LogItemProps {
    labels: { [key: string]: string }
    log: [string, string]
    panel: Panel
}
const LogItem = ({ labels, log, panel }: LogItemProps) => {
    const [collapsed, setCollapsed] = useState(true)
    const timestamp = toNumber(log[0]) / 1e6
    const options = panel.plugins.log
    const LabelLayout = options.labels.layout == LayoutOrientation.Horizontal ? HStack : Box
    return (<>
        <HStack pt="1" alignItems="start" spacing={2} pl="2" pr="4" onClick={() => setCollapsed(!collapsed)} cursor="pointer"  fontSize={options.styles.fontSize}>
            <HStack spacing={1}>
                <CollapseIcon collapsed={collapsed} fontSize="0.6rem" opacity="0.6" mt={options.showTime ? 0 : '6px'} />
                {options.showTime && <Text fontWeight={450} minWidth={options.timeColumnWidth ?? 155}>
                    {dateTimeFormat(timestamp, { format: 'YY-MM-DD HH:mm:ss.SSS' })}
                </Text>}
            </HStack>
            {options.labels.display.length > 0 &&
                <HStack minWidth={options.labels.width ?? options.labels.display.length * 150} maxWidth={options.labels.width ?? 300} justifyContent="center" spacing={options.labels.layout == LayoutOrientation.Horizontal ? 2 : 3} transition="width 0.3s">
                    {
                        Object.keys(labels).map(key => options.labels.display.includes(key) && <LabelLayout spacing={0}>
                            <LabelName name={key} color={options.styles.labelColor}/>
                            {options.labels.layout == LayoutOrientation.Horizontal &&
                                <Text>=</Text>}
                            <LabelValue value={labels[key]} color={options.styles.labelValueColor}/>
                        </LabelLayout>)
                    }
                </HStack>}
            <Text wordBreak="break-all" color={options.styles.contentColor}>{log[1]}</Text>
        </HStack>
        {
            !collapsed && <Box p="4" fontSize={options.styles.fontSize}>
                <VStack alignItems="left" className="bordered" p="2">
                    {
                        Object.keys(labels).map(key => <HStack px="2" spacing={1}  >
                            <Box minWidth="20em" >
                                <LabelName name={key} color={options.styles.labelColor}/>
                            </Box>

                            <LabelValue value={labels[key]} color={options.styles.labelValueColor}/>

                        </HStack>)
                    }
                </VStack>
            </Box>}
    </>)
}

const LabelName = ({ name, color }: { name: string; color: string }) => {
    return <Text fontWeight={500} color={color}>
        {name}
    </Text>
}

const LabelValue = ({ value, color }: { value: string; color: string }) => {
    return <Text color={color}>
        {value}
    </Text>
}