import { Box, Button, Flex, HStack, Input, Select, Text } from "@chakra-ui/react"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"
import moment from "moment"
import { Trace } from "types/plugins/trace"
import { formatDuration } from "../../utils/date"
import SpanGraph from "./SpanGraph"
import { useState } from "react"
import { IViewRange, ViewRangeTimeUpdate } from "../../types/types"
import CollapseIcon from "components/icons/Collapse"
import { AiOutlineArrowUp, AiOutlineDown, AiOutlineUp } from "react-icons/ai"

interface Props {
    trace: Trace
    viewRange: IViewRange
    updateNextViewRangeTime: (update: ViewRangeTimeUpdate) => void
    updateViewRangeTime: any
    collapsed: boolean
    onGraphCollapsed: any
    search: string 
    onSearchChange: any
    searchCount: number
    prevResult: any 
    nextResult: any
}

const TraceDetailHeader = ({ trace, viewRange, updateNextViewRangeTime, updateViewRangeTime,collapsed, onGraphCollapsed, search, onSearchChange, prevResult, nextResult}: Props) => {

    return (<>
        <Flex justifyContent="space-between" alignItems="center">
            <HStack>
                <CollapseIcon collapsed={collapsed} onClick={onGraphCollapsed}/>
                <Text>{trace.traceName}</Text>
                <Text>{trace.traceID.slice(0, 7)}</Text>
            </HStack>
            <HStack>
                <HStack spacing={1}>
                    <Input placeholder="Search.." value={search} onChange={e => onSearchChange(e.currentTarget.value)}/>
                    <Button size="sm" variant="outline" onClick={prevResult}><AiOutlineUp /></Button>
                    <Button size="sm" variant="outline" onClick={nextResult}><AiOutlineDown /></Button>
                </HStack>
                <Select>
                    <option>Trace Timeline</option>
                </Select>
                <ColorModeSwitcher />
            </HStack>
        </Flex>
        <HStack className="label-bg" px="2" py="1" fontSize="0.9rem" spacing={4}>
            <HStack>
                <Text opacity="0.8">Start time</Text>
                <Text>{moment(trace.startTime / 1000).format('yy-MM-DD hh:mm:ss.SSS')}</Text>
            </HStack>
            <HStack>
                <Text opacity="0.8">Duration</Text>
                <Text>{formatDuration(trace.duration)}</Text>
            </HStack>
            <HStack>
                <Text opacity="0.8">Services</Text>
                <Text>{trace.services.length}</Text>
            </HStack>
            <HStack>
                <Text opacity="0.8">Depth</Text>
                <Text>{Math.max(...trace.spans.map(span => span.depth)) + 1}</Text>
            </HStack>
            <HStack>
                <Text opacity="0.8">Spans</Text>
                <Text>{trace.spans.length}</Text>
            </HStack>
            <HStack>
                <Text opacity="0.8">Errors</Text>
                <Text>{trace.errorsCount}</Text>
            </HStack>
        </HStack>
        {!collapsed && <SpanGraph trace={trace} viewRange={viewRange} updateNextViewRangeTime={updateNextViewRangeTime} updateViewRangeTime={updateViewRangeTime} />}
    </>)
}

export default TraceDetailHeader