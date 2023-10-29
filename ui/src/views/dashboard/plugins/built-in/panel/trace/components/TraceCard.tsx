import { Box, Checkbox, Flex, HStack, Tag, TagLabel, TagLeftIcon, Text, Wrap, WrapItem, useColorModeValue, useMediaQuery } from "@chakra-ui/react"
import { Trace } from "src/views/dashboard/plugins/built-in/panel/trace/types/trace"
import { formatDuration, formatRelativeDate } from "utils/date"
import { sortBy } from "lodash"
import {ColorGenerator} from "utils/colorGenerator"
import { FaInfoCircle } from "react-icons/fa"
import moment from "moment"
import React from "react";
import { getDatasource } from "utils/datasource"
import { MobileBreakpoint } from "src/data/constants"
import { colors1, colors2, colors3, paletteColorNameToHex, palettes } from "utils/colors"
import { Datasource } from "types/datasource"
import customColors from "theme/colors"

interface Props {
    trace: Trace
    maxDuration: number
    checked?: boolean
    onChecked?: (traceId: string) => void
    checkDisabled?: boolean
    simple?: boolean
    onClick?: any
}

const TraceCard = ({ trace, maxDuration,checked=false, onChecked=null,simple=false,checkDisabled=false, onClick}: Props) => {
    const mDate = moment(trace.startTime / 1000);
    const timeStr = mDate.format('h:mm:ss a')

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)

    const colorGenerator =  new ColorGenerator(colors1)

    return (<Box width="100%" borderRadius="0" cursor="pointer"  onClick={onClick} fontSize={isLargeScreen ? "sm" : "xs"}>
        <Box width="100%" position="relative" className="label-bg">
            <HStack spacing={0} py="2px">
                {onChecked && <Flex alignItems="center" px="2" zIndex={2}  onClick={e => {
                    e.stopPropagation(); 
                }}><Checkbox size="sm" defaultChecked={checked} isChecked={checked} isDisabled={checkDisabled} bg={useColorModeValue("white", customColors.bodyBg.dark)} onChange={e =>  onChecked(trace.traceID)  }/></Flex>}
                <Box width={`${(trace.duration / maxDuration) * 100}%`} className="tag-bg" height="100%" position="absolute" top="0"></Box>
                <Flex color={customColors.textColor.light} alignItems="center" width="100%" justifyContent="space-between" position="relative" pr="2" >
                    <Flex flexDir={isLargeScreen ? "row" : "column"} gap={isLargeScreen ? 1 : 0}>
                        <Text>{trace.traceName}</Text>
                        <Text opacity="0.7">{trace.traceID.slice(0, 7)}</Text>
                    </Flex>
                    <Text minWidth="fit-content">{formatDuration(trace.duration)}</Text>
                </Flex>
            </HStack>
        </Box>
        <Flex flexDir={isLargeScreen ? "row" : "column"} alignItems={isLargeScreen ? "center" : "start"} width="100%" justifyContent={isLargeScreen ? "space-between"  : null} pt={isLargeScreen ? 2 : 2} pb={isLargeScreen ? 4 : 3} px={isLargeScreen ? 2 : 1}>
            <Box>
                <HStack alignItems="top">
                    <Tag size="md" variant="subtle" colorScheme="gray" bg="transparent" fontSize="0.9em">{trace.services.reduce((t,e)=>e.numberOfSpans,0)} Spans</Tag>
                    <Tag size="md" variant="subtle" colorScheme="gray" bg="transparent"  fontSize="0.9em">{Object.keys(trace.services).length} Services</Tag>
                    {trace.errorsCount > 0 && <Tag size="sm" variant="subtle" colorScheme="gray" bg="transparent" color={paletteColorNameToHex(palettes[15])}  fontSize="0.9em">{trace.errorsCount} Errors</Tag>}
                  
                </HStack>
                {!simple && <Wrap mt={1} spacingX={3}>
                    {sortBy(trace.services, s => s.name).map(service => {
                        const { name, numberOfSpans: count } = service;
                        return (
                            <WrapItem key={name}>
                                <Tag
                                    variant="subtle"
                                    colorScheme="gray"
                                    bg="transparent"
                                    className="bordered"
                                    borderLeft={`4px solid ${colorGenerator.getColorByKey(name)}`}
                                    size="sm"
                                    borderRadius={2}
                                    opacity={0.8}
                                >
                                    {trace.errorServices.has(name) && <TagLeftIcon color={paletteColorNameToHex(palettes[15])} as={FaInfoCircle} />}
                                    <TagLabel >{name} {count}</TagLabel>
                                </Tag>
                            </WrapItem>
                        );
                    })}
                </Wrap>}
            </Box>

            <Box mt={isLargeScreen ? 0 : 2}>
                {!simple && <HStack spacing={1}>
                    {/* @datetime-examples */}
                    <Text className="bordered-right" pr="1">{formatRelativeDate(trace.startTime / 1000)}</Text>
                    <Text>{timeStr}</Text>
                </HStack>}
                {isLargeScreen && <Text mt="1">{mDate.fromNow()}</Text>}
            </Box>
        </Flex>
    </Box>)
}

export default TraceCard

