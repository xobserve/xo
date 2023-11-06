// Copyright 2023 xObserve.io Team
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
import { Box, Divider, Drawer, DrawerBody, DrawerContent, DrawerOverlay, Flex, HStack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Tooltip, useColorModeValue, useMediaQuery, VStack } from "@chakra-ui/react"
import ColorKV from "components/ColorKV"
import CopyToClipboard from "components/CopyToClipboard"
import moment from "moment"
import React, { useMemo, useState } from "react"
import { FaSearch, FaSearchPlus } from "react-icons/fa"
import { IsSmallScreen } from "src/data/constants"
import { Field } from "types/seriesData"
import { seriesFieldsToOpenTelemetryLog } from "../../../utils/opentelemetry"
import { formatLogTimestamp } from "./utils"


interface Props {
    log: Field[]
    isOpen: boolean
    onClose: any
    onSearch: any 
}
const LogDetail = ({ log: rawlog, isOpen, onClose, onSearch }: Props) => {
    const [isMobileScreen] = useMediaQuery(IsSmallScreen)

    const log = useMemo(() => {
        return seriesFieldsToOpenTelemetryLog(rawlog)
    }, [rawlog])

    const isError = log.severityText == "error"
    const basicKV = [
        ["id", log.id],
        ["severity", log.severityText],
        ["environment", log.environment],
        ["service", log.service],
        ["host", log.host],
        ["trace_id", log.traceId],
        ["span_id", log.spanId],
        ["timestamp", log.timestamp],
        ["body", log.body],
    ]
    return (<Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        size={isMobileScreen ? "sm" : "lg"}
    >
        <DrawerOverlay />
        <DrawerContent>
            <DrawerBody fontSize="0.9rem" py="6" px="4">
                <Flex gap={2} alignItems="center">
                    <Text opacity={!isError && 0.7} className={isError && "error-text"}>{log.severityText} at </Text>
                    <Text>{formatLogTimestamp(log.timestamp)}</Text>
                    <Text opacity={0.7}>{moment(log.timestamp / 1e6).fromNow()}</Text>
                </Flex>
                <Text className="label-bg" p="2" mt="2">
                    {log.body}
                </Text>

                <Tabs size="sm" mt="4">
                    <TabList>
                        <Tab>Properties</Tab>
                        <Tab>Original log</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <VStack alignItems="left" fontSize="0.9rem">
                                {
                                    basicKV.map(r => <LogKV k={r[0]} v={r[1]} onSearch={(isNew) => onSearch(`${r[0]}=${typeof r[1] == "string" ? `"${r[1]}"`: r[1]}`,isNew)}/>)
                                }
                            </VStack>
                            <Text fontWeight={550} mt="4" fontSize="0.85rem">Resources</Text>
                            <Divider mt="2" />
                            <VStack alignItems="left" fontSize="0.9rem" mt="2">
                                {
                                    log.resources.map(r => <LogKV k={r[0]} v={r[1]} onSearch={(isNew) => onSearch(`resources.${r[0]}=${typeof r[1] == "string" ? `"${r[1]}"`: r[1]}`,isNew)}/>)
                                }
                            </VStack>

                            <Text fontWeight={550} mt="4" fontSize="0.85rem">Attributes</Text>
                            <Divider mt="2" />
                            <VStack alignItems="left" fontSize="0.9rem" mt="2">
                                {
                                    log.attributes.map(r => <LogKV k={r[0]} v={r[1]} onSearch={(isNew) => onSearch(`attributes.${r[0]}=${typeof r[1] == "string" ? `"${r[1]}"`: r[1]}`,isNew)}/>)
                                }
                            </VStack>
                        </TabPanel>
                        <TabPanel>
                            <Text color={useColorModeValue("rgb(10, 166, 0)", "rgb(166, 226, 46)")} >{log.attributes.find(v => v[0] == 'raw_log')[1]}</Text>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </DrawerBody>
        </DrawerContent>
    </Drawer>)
}

export default LogDetail

const LogKV = ({ k, v, onSearch}) => {
    const [onHover, setOnHover] = useState(false)
    return <Flex gap="2" onMouseEnter={() => setOnHover(true)} onMouseLeave={() => setOnHover(false)} >
        <ColorKV k={k} v={v} />

        <HStack opacity={0.5} fontSize="0.8rem" position="relative" visibility={onHover ? "visible" : "hidden"}>
            <Tooltip label="Add to current search"><Box cursor="pointer"><FaSearchPlus onClick={() => onSearch(false)} /></Box></Tooltip>
            <Tooltip label="Search with this value"><Box cursor="pointer"><FaSearch onClick={() => onSearch(true)}/></Box></Tooltip>
            <CopyToClipboard copyText={v} tooltipTitle="copy this value" fontSize="0.7rem"/>
        </HStack>
    </Flex>
}