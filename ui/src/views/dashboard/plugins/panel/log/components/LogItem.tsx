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

import React, { memo, useEffect, useMemo, useState } from "react";
import { Box, HStack, Highlight, Text, VStack } from "@chakra-ui/react"
import { Panel } from "types/dashboard"
import { dateTimeFormat } from "utils/datetime/formatter";
import { isEmpty, toNumber } from "lodash";
import CollapseIcon from "components/icons/Collapse";
import { LayoutOrientation } from "types/layout";
import { paletteColorNameToHex } from "utils/colors";
import { Log } from "types/plugins/log";

interface LogItemProps {
    log: Log
    panel: Panel
    collapsed: boolean
}
const LogItem = memo((props: LogItemProps) => {
    const { log, panel } = props
    const labels = log.labels
    const [collapsed, setCollapsed] = useState(true)
    useEffect(() => {
        setCollapsed(props.collapsed)
    },[props.collapsed])
    const timestamp = toNumber(log.timestamp) / 1e6
    const options = panel.plugins.log
    const LabelLayout = options.labels.layout == LayoutOrientation.Horizontal ? HStack : Box
    const timestampColor = useMemo(() => {
        for (const t of panel.plugins.log.thresholds) {
            if (t.type !== null && isEmpty(t.value)) {
                continue
            }
            if (t.type == "label") {
                for (const k of Object.keys(labels)) {
                    if (k == t.key && labels[k].match(t.value)) {
                        return t.color
                    }
                }
            }

            if (t.type == "content") {
                if (log.content.toLowerCase().match(t.value)) {
                    return t.color
                }
            }

            if (t.type == null) {
                return t.color
            }
        }
    },[panel.plugins.log.thresholds, log, labels])
    return (<>
        <HStack pt="1" alignItems="start" spacing={2} pl="2" pr="4" onClick={() => setCollapsed(!collapsed)} cursor="pointer"  fontSize={options.styles.fontSize}>
            <HStack spacing={1}>
                <CollapseIcon collapsed={collapsed} fontSize="0.6rem" opacity="0.6" mt={options.showTime ? 0 : '6px'} />
                {options.showTime && <Text minWidth={options.timeColumnWidth ?? 155} color={paletteColorNameToHex(timestampColor)}>
                    {dateTimeFormat(timestamp, { format: 'YY-MM-DD HH:mm:ss.SSS' })}
                </Text>}
            </HStack>
            {options.labels.display.length > 0 &&
                <HStack minWidth={options.labels.width ?? options.labels.display.length * 150} maxWidth={options.labels.width ?? 300} spacing={options.labels.layout == LayoutOrientation.Horizontal ? 2 : 3}>
                    {
                        Object.keys(labels).map(key => options.labels.display.includes(key) && <LabelLayout spacing={0}>
                            <LabelName name={key} color={options.styles.labelColor}/>
                            {options.labels.layout == LayoutOrientation.Horizontal &&
                                <Text>=</Text>}
                            <LabelValue value={labels[key]} color={options.styles.labelValueColor}/>
                        </LabelLayout>)
                    }
                </HStack>}
            <Text wordBreak={options.styles.wordBreak} color={paletteColorNameToHex(options.styles.contentColor)}><Highlight query={log.highlight??[]} styles={{ px: '1', py: '1',borderRadius: 4,  bg: 'teal.100' }}>{log.content}</Highlight></Text>
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
})

export default LogItem

const LabelName = ({ name, color }: { name: string; color: string }) => {
    return <Text fontWeight={500} color={paletteColorNameToHex(color)}>
        {name}
    </Text>
}

const LabelValue = ({ value, color }: { value: string; color: string }) => {
    return <Text color={paletteColorNameToHex(color)}>
        {value}
    </Text>
}