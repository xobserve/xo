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
import { Box, Divider, Drawer, DrawerBody, DrawerContent, DrawerOverlay, Flex, HStack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useColorModeValue, useMediaQuery, VStack } from "@chakra-ui/react"
import moment from "moment"
import React, { useMemo } from "react"
import { IsSmallScreen } from "src/data/constants"
import { Field } from "types/seriesData"
import { seriesFieldsToOpenTelemetryLog } from "../../../utils/opentelemetry"
import { formatLogTimestamp } from "./utils"


interface Props {
    log: Field[]
    isOpen: boolean
    onClose: any
}
const LogDetail = ({ log: rawlog, isOpen, onClose }: Props) => {
    const [isMobileScreen] = useMediaQuery(IsSmallScreen)

    const log = useMemo(() => {
        return seriesFieldsToOpenTelemetryLog(rawlog)
    }, [rawlog])

    console.log("here333333:", log)
    const isError = log.severityText == "error"
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
                            <VStack alignItems="left" fontSize="0.85rem">
                                <LogKV k="id" v={log.id} />
                                <LogKV k="severity_text" v={log.severityText} />
                                <LogKV k="namespace" v={log.namespace} />
                                <LogKV k="service" v={log.service} />
                                <LogKV k="host" v={log.host} />
                                <LogKV k="trace_id" v={log.traceId} />
                                <LogKV k="span_id" v={log.spanId} />
                                <LogKV k="timestamp" v={log.timestamp} />
                                <LogKV k="body" v={log.body} />
                            </VStack>
                            <Text fontWeight={550} mt="4" fontSize="0.85rem">Resources</Text>
                            <Divider mt="2" />
                            <VStack alignItems="left" fontSize="0.85rem" mt="2">
                                {
                                    log.resources.map(r => <LogKV k={r[0]} v={r[1]} />)
                                }
                            </VStack>

                            <Text fontWeight={550} mt="4" fontSize="0.85rem">Attributes</Text>
                            <Divider mt="2" />
                            <VStack alignItems="left" fontSize="0.85rem" mt="2">
                                {
                                    log.attributes.map(r => <LogKV k={r[0]} v={r[1]} />)
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

const LogKV = ({ k, v }) => {
    return <Flex gap="2">
        <Text color="rgb(131, 120, 255)" minW="fit-content">{k}</Text>
        <Text color={useColorModeValue("rgb(0, 166, 0)", "rgb(166, 226, 46)")} >{v}</Text>
    </Flex>
}