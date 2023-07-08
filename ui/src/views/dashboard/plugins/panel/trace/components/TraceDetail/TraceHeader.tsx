import { Box, Flex, HStack, Input, Select, Text } from "@chakra-ui/react"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"
import moment from "moment"
import { Trace } from "types/plugins/trace"
import { formatDuration } from "../../utils/date"
import SpanGraph from "./SpanGraph"
import { useState } from "react"
import { IViewRange, ViewRangeTimeUpdate } from "../../types/types"
import CollapseIcon from "components/icons/Collapse"

interface Props {
    trace: Trace
}

const TraceDetailHeader = ({ trace }: Props) => {
    const [collapsed, setCollapsed] = useState(true)
    const [viewRange, setViewRange] = useState<IViewRange>({
        time: {
            current: [0, 1],
        },
    })

    const updateNextViewRangeTime = (update: ViewRangeTimeUpdate) => {
        const time = { ...viewRange.time, ...update };
        setViewRange({ ...viewRange, time });
    };

    const updateViewRangeTime = (start: number, end: number, trackSrc?: string) => {
        const current: [number, number] = [start, end];
        const time = { current };
        setViewRange({ ...viewRange, time })
    };

    return (<Box>
        <Flex justifyContent="space-between" alignItems="center">
            <HStack>
                <CollapseIcon collapsed={collapsed} onClick={() => setCollapsed(!collapsed)}/>
                <Text>{trace.traceName}</Text>
                <Text>{trace.traceID.slice(0, 7)}</Text>
            </HStack>
            <HStack>
                <Input placeholder="Search.." />
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
    </Box>)
}

export default TraceDetailHeader