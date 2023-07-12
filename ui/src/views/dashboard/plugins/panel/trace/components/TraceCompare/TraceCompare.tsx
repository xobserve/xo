import { Box, Button, Center, Divider, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react"
import { Trace } from "types/plugins/trace"
import { formatDuration, formatRelativeDate } from "../../utils/date"
import moment from "moment"
import TraceCompareGraph from "./TraceCompareGraph"
import React from "react";

interface Props {
    traces: Trace[]
}
const TraceCompare = ({ traces }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const compareTraces = () => {
        onOpen()
    }

    return (
        <>
            <Button size="sm" variant="outline" onClick={compareTraces} isDisabled={traces.length <= 1}>Compare</Button>

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