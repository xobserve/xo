import { Box, Checkbox, Flex, HStack, Tag, TagLabel, TagLeftIcon, Text, Wrap, WrapItem, useColorModeValue } from "@chakra-ui/react"
import { Trace } from "types/plugins/trace"
import { formatDuration, formatRelativeDate } from "utils/date"
import { sortBy } from "lodash"
import colorGenerator from "utils/colorGenerator"
import { FaInfoCircle } from "react-icons/fa"
import moment from "moment"
import React from "react";
import { getDatasource } from "utils/datasource"

interface Props {
    trace: Trace
    maxDuration: number
    checked?: boolean
    onChecked?: (traceId: string) => void
    checkDisabled?: boolean
    simple?: boolean
    dsId?: number
}

const TraceCard = ({ trace, maxDuration,checked=false, onChecked=null,simple=false,checkDisabled=false,dsId=null}: Props) => {
    const mDate = moment(trace.startTime / 1000);
    const timeStr = mDate.format('h:mm:ss a')
    const ds = getDatasource(dsId)
    const onTraceClick = () => {
        if (ds) {
            window.open(`/trace/${trace.traceID}/${ds.id}/`)
        }
    }

    return (<Box width="100%" className="bordered" borderRadius="0" cursor="pointer" onClick={onTraceClick}>
        <Box width="100%" position="relative" className="label-bg">
            <HStack spacing={0} py="5px">
                {onChecked && <Flex alignItems="center" px="2" zIndex={2}  onClick={e => {
                    e.stopPropagation(); 
                }}><Checkbox defaultChecked={checked} isChecked={checked} isDisabled={checkDisabled} bg={useColorModeValue("white", "transparent")} onChange={e =>  onChecked(trace.traceID)  }/></Flex>}
                <Box width={`${(trace.duration / maxDuration) * 100}%`} bg={useColorModeValue("#d7e7ea", "brand.800")} height="100%" position="absolute" top="0"></Box>
                <Flex alignItems="center" width="100%" justifyContent="space-between" position="relative" pr="2" >
                    <HStack>
                        <Text>{trace.traceName}</Text>
                        <Text>{trace.traceID.slice(0, 7)}</Text>
                    </HStack>
                    <Text fontSize="0.9rem">{formatDuration(trace.duration)}</Text>
                </Flex>
            </HStack>
        </Box>
        <Flex alignItems="center" width="100%" justifyContent="space-between" pt="4" pb="3" px="2">
            <Box>
                <HStack alignItems="top">
                    <Tag size="md" variant="subtle" colorScheme="gray" bg="transparent" className="bordered" fontSize="0.8rem">{trace.spans.length} Spans</Tag>
                    <Tag size="md" variant="subtle" colorScheme="gray" bg="transparent" className="bordered" fontSize="0.8rem">{Object.keys(trace.processes).length} Services</Tag>
                    {trace.errorsCount > 0 && <Tag size="md" variant="subtle" colorScheme="red" className="bordered" fontSize="0.8rem">{trace.errorsCount} Errors</Tag>}
                  
                </HStack>
                {!simple && <Wrap mt="4" spacingX={3}>
                    {sortBy(trace.services, s => s.name).map(service => {
                        const { name, numberOfSpans: count } = service;
                        return (
                            <WrapItem key={name}>
                                <Tag
                                    variant="subtle"
                                    colorScheme="gray"
                                    bg="transparent"
                                    className="bordered"
                                    borderLeft={`12px solid ${colorGenerator.getColorByKey(name)}`}
                                    size="sm"
                                    borderRadius={4}
                                    opacity={0.8}
                                >
                                    {trace.errorServices.has(name) && <TagLeftIcon color="red" as={FaInfoCircle} />}
                                    <TagLabel >{name} {count}</TagLabel>
                                </Tag>
                            </WrapItem>
                        );
                    })}
                </Wrap>}
            </Box>

            <Box fontSize="0.8rem">
                {!simple && <HStack spacing={1}>
                    {/* @datetime-examples */}
                    <Text className="bordered-right" pr="1">{formatRelativeDate(trace.startTime / 1000)}</Text>
                    <Text>{timeStr}</Text>
                </HStack>}
                <Text mt="1">{mDate.fromNow()}</Text>
            </Box>
        </Flex>
    </Box>)
}

export default TraceCard

