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

import { Box, Button, Center, Divider, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react"
import { Trace } from "src/views/dashboard/plugins/built-in/panel/trace/types/trace"
import { formatDuration, formatRelativeDate } from "utils/date"
import moment from "moment"
import TraceCompareGraph from "./TraceCompareGraph"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg } from "src/i18n/locales/en"

interface Props {
    traces: Trace[]
}
const TraceCompare = ({ traces }: Props) => {
    const t = useStore(commonMsg)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const compareTraces = () => {
        onOpen()
    }

    return (
        <>
            <Button size="sm" variant="outline" onClick={compareTraces} isDisabled={traces.length <= 1}>{t.compore}</Button>

            <Modal isOpen={isOpen} onClose={onClose} size="full">
                <ModalOverlay />
                {traces.length == 2 && <ModalContent>
                    <ModalHeader p="0">
                        <HStack>
                            <Box width="47%" className="bordered" p="3">
                                <TraceInfo trace={traces[0]} />
                            </Box>
                            <Center width="6%"><Text fontSize="1.5rem" color="brand.500">VS</Text></Center>
                            <Box width="47%" className="bordered" p="3">
                                <TraceInfo trace={traces[1]} />
                            </Box>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton left="49%" top="0" />
                    <ModalBody position="relative">
                        <TraceCompareGraph traceA={traces[0]} traceB={traces[1]} />
                    </ModalBody>
                </ModalContent>}
            </Modal>
        </>
    )
}

export default TraceCompare

const TraceInfo = ({ trace }: { trace: Trace }) => {
    const mDate = moment(trace.startTime / 1000)
    const timeStr = mDate.format('h:mm:ss a')
    return (<>
        <HStack>
            <Text>{trace.traceName}</Text>
            <Text>{trace.traceID.slice(0, 7)}</Text>
        </HStack>
        <Divider mt="2" />
        <Flex justifyContent="space-between" alignItems="center" fontSize={"0.85rem"} mt="2">
            <HStack >
                <HStack>
                    <Text opacity="0.7">Duration:</Text>
                    <Text>{formatDuration(trace.duration)}</Text>
                </HStack>
                <HStack>
                    <Text opacity="0.7">Spans:</Text>
                    <Text>{trace.spans.length}</Text>
                </HStack>
                <HStack>
                    <Text opacity="0.7">Services:</Text>
                    <Text>{trace.services.length}</Text>
                </HStack>
                <HStack>
                    <Text opacity="0.7">Errors:</Text>
                    <Text color="red">{trace.errorsCount}</Text>
                </HStack>
            </HStack>
            <HStack>
                <Text className="bordered-right" pr="1">{formatRelativeDate(trace.startTime / 1000)}</Text>
                <Text>{timeStr}</Text>
            </HStack>
        </Flex>
    </>)
}