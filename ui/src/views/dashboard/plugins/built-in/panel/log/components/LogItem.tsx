// Copyright 2023 observex.io Team
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
import { Box, Button, Divider, Flex, HStack, Highlight, Text, Textarea, VStack, useColorMode, useColorModeValue, useMediaQuery, useToast } from "@chakra-ui/react"
import { Panel } from "types/dashboard"
import { dateTimeFormat } from "utils/datetime/formatter";
import { isEmpty, isFunction} from "lodash";
import CollapseIcon from "src/components/icons/Collapse";
import { LayoutOrientation } from "types/layout";
import { paletteColorNameToHex } from "utils/colors";
import { Log } from "../types";
import { formatLabelId, getLabelNameColor } from "../utils";
import { MobileVerticalBreakpointNum } from "src/data/constants";
import { toJSON, toPrettyJSON } from "utils/is";
import { commonInteractionEvent, genDynamicFunction } from "utils/dashboard/dynamicCall";
import { getStringColorMapping } from "src/views/dashboard/plugins/components/StringColorMapping";

interface LogItemProps {
    log: Log
    panel: Panel
    collapsed: boolean
    width: number
    colorGenerator: any
}

const LogItem = memo((props: LogItemProps) => {
    const { log, panel, width, colorGenerator } = props
    const toast = useToast()
    const { colorMode } = useColorMode()
    const labels = log.labels
    const [collapsed, setCollapsed] = useState(true)
    useEffect(() => {
        setCollapsed(props.collapsed)
    }, [props.collapsed])
    const options = panel.plugins.log
    const LabelLayout = options.labels.layout == LayoutOrientation.Horizontal ? HStack : Box
    const timestampColor = useMemo(() => {
        for (const t of panel.plugins.log.thresholds) {
            if (t.type !== null && isEmpty(t.value)) {
                continue
            }
            if (t.type == "label") {
                for (const k of Object.keys(labels)) {
                    if (k == t.key && labels[k]?.match(t.value)) {
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
    }, [panel.plugins.log.thresholds, log, labels])
    let timeString;

    const nsPart = log.timestamp.toString().slice(13)
    const usPart = nsPart.slice(0, 3)
    const timestamp = log.timestamp / 1e6
    switch (options.timeStampPrecision) {
        case "ns":
            timeString = dateTimeFormat(timestamp, { format: "YY-MM-DD HH:mm:ss.SSS" }) + nsPart
            break;
        case "us":
            timeString = dateTimeFormat(timestamp, { format: "YY-MM-DD HH:mm:ss.SSS" }) + usPart
            break
        case "ms":
            timeString = dateTimeFormat(timestamp, { format: "YY-MM-DD HH:mm:ss.SSS" })
            break
        default:
            timeString = dateTimeFormat(timestamp, { format: "YY-MM-DD HH:mm:ss" })
            break;
    }

    const labelNameColor = (id) => {
        return options.styles.labelColorSyncChart ? getLabelNameColor(id, colorMode, colorGenerator) : options.styles.labelColor
    }

    const isMobileScreen = width < MobileVerticalBreakpointNum

    let labelWidthMap = toJSON(options.labels.widthMap) ?? {}

    return (<>
        <Flex flexDir={isMobileScreen ? "column" : "row"} pt="1" alignItems="start" gap={isMobileScreen ? 1 : 2} pl="2" pr="4" onClick={options.enableDetails ? () => setCollapsed(!collapsed) : null} cursor={options.enableDetails ? "pointer" : null} fontSize={options.styles.fontSize}>
            <HStack spacing={1}>
                {options.enableDetails && <CollapseIcon collapsed={collapsed} fontSize="0.6rem" opacity="0.6" mt={options.showTime ? 0 : '6px'} />}
                {options.showTime && <Text minWidth={options.timeColumnWidth ?? 155} color={paletteColorNameToHex(timestampColor)}>
                    {timeString}
                </Text>}
            </HStack>
            {options.labels.display.length > 0 &&
                <HStack alignItems="center" maxW="100%" spacing={options.labels.layout == LayoutOrientation.Horizontal ? 2 : 3}>
                    {
                        Object.keys(labels).map(key => options.labels.display.includes(key) &&  <LabelLayout alignItems="start" key={key + labels[key]} spacing={0} width={(labelWidthMap[key] ?? options.labels.width ?? 100) + 'px'} >
                            <LabelName name={!isEmpty(labels[key]) && key} color={log.labelHighlight.indexOf(key.toLowerCase()) >= 0 ? paletteColorNameToHex(options.styles.highlightColor) : labelNameColor(formatLabelId(key, labels[key]))} />
                            {options.labels.layout == LayoutOrientation.Horizontal && !isEmpty(labels[key]) &&
                                <Text>=</Text>}
                            <LabelValue value={labels[key]} color={log.labelHighlight.indexOf(labels[key]?.toLowerCase()) >= 0 ? paletteColorNameToHex(options.styles.highlightColor) : paletteColorNameToHex(getStringColorMapping(labels[key],options.styles.labelValueColor))} maxLines={options.labels.maxValueLines} />
                        </LabelLayout>)
                    }
                </HStack>}
            <Box color={paletteColorNameToHex(options.styles.contentColor)}><pre style={{ wordBreak: options.styles.wordBreak, whiteSpace: options.styles.wrapLine ? "pre-wrap" : null }}><TextHighlight text={log.content} color={options.styles.highlightColor} highlight={log.highlight} /></pre></Box>
        </Flex>
        {
            !collapsed && <Box p="4" fontSize={options.styles.fontSize}>

                <VStack alignItems="left" className="bordered" p="2" mt="1">
                    {options.interaction.enable && <>
                        <HStack spacing={1}>
                            {options.interaction.actions.map((action, index) => {
                                if (isEmpty(action.name)) {
                                    return
                                }
                                const onClick = genDynamicFunction(action.action);
                                return <Button key={index + action.name} colorScheme={action.color} variant={action.style} size={"xs"} onClick={(e) => {
                                    e.stopPropagation()
                                    if (!isFunction(onClick)) {
                                        toast({
                                            title: "Error",
                                            description: "The action function you defined is not valid",
                                            status: "error",
                                            duration: 4000,
                                            isClosable: true,
                                        })
                                    } else {
                                        commonInteractionEvent(onClick, log)
                                    }
                                }}>{action.name}</Button>
                            })}
                        </HStack>
                    <Divider />
                    </>}
                    {
                        Object.keys(labels).map(key => !isEmpty(labels[key]) &&  <HStack key={key + labels[key]} px="2" spacing={1}  >
                            <Box minWidth={isMobileScreen ? "10em" : "20em"}>
                                <LabelName name={key} color={labelNameColor(formatLabelId(key, labels[key]))} />
                            </Box>
                            <LabelValue value={labels[key]} color={paletteColorNameToHex(getStringColorMapping(labels[key],options.styles.labelValueColor))} maxLines={options.labels.maxValueLines} />

                        </HStack>)
                    }
                </VStack>

                <Box p="2"><pre>{toPrettyJSON(log.content)}</pre></Box>
            </Box>}
    </>)
})

export default LogItem

const LabelName = ({ name, color }: { name: string; color: string }) => {
    return <Text  color={paletteColorNameToHex(color)} minW="fit-content">
        {name}
    </Text>
}

const LabelValue = ({ value, color, maxLines }: { value: string; color: string, maxLines: number }) => {
    return <Text color={paletteColorNameToHex(color)} wordBreak="break-all" noOfLines={maxLines}>
        {value}
    </Text>
}

const TextHighlight = ({ text, highlight, color }) => {
    return <Highlight query={highlight ?? []} styles={{ px: '0', py: '0', borderRadius: 4, color: paletteColorNameToHex(color), fontWeight: 600 }}>{text}</Highlight>
}