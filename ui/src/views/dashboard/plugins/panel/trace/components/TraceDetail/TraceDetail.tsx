import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react"
import { Trace } from "types/plugins/trace"
import TraceDetailHeader from "./TraceHeader"

import ScrollManager from './scroll/scrollManager';
import { useState } from "react";
import { IViewRange, ViewRangeTimeUpdate } from "../../types/types";
import TraceTimeline from "./TraceTimeline/TraceTimeline";
import customColors from "src/theme/colors";

interface Props {
    trace: Trace
    scrollManager: ScrollManager
}
const TraceDetail = ({ trace, scrollManager }: Props) => {
    const [viewRange, setViewRange] = useState<IViewRange>({
        time: {
            current: [0, 1],
        },
    })
    const [collapsed, setCollapsed] = useState(true)

    const updateNextViewRangeTime = (update: ViewRangeTimeUpdate) => {
        const time = { ...viewRange.time, ...update };
        setViewRange({ ...viewRange, time });
    };

    const updateViewRangeTime = (start: number, end: number, trackSrc?: string) => {
        const current: [number, number] = [start, end];
        const time = { current };
        setViewRange({ ...viewRange, time })
    };

    let spanFindMatches: Set<string> | null | undefined;

    return (<Box maxHeight="100vh" overflowY="scroll">
        <Box position="fixed" width="100%" bg={useColorModeValue('#fff', customColors.bodyBg.dark)} zIndex="1000">
            <TraceDetailHeader trace={trace} viewRange={viewRange} updateNextViewRangeTime={updateNextViewRangeTime} updateViewRangeTime={updateViewRangeTime} onGraphCollapsed={() => setCollapsed(!collapsed)} collapsed={collapsed} />
        </Box>
        <Box mt={collapsed ? "67px": "144px"}>
            <TraceTimeline
                registerAccessors={scrollManager.setAccessors}
                scrollToFirstVisibleSpan={scrollManager.scrollToFirstVisibleSpan}
                findMatchesIDs={spanFindMatches}
                trace={trace}
                updateNextViewRangeTime={updateNextViewRangeTime}
                updateViewRangeTime={updateViewRangeTime}
                viewRange={viewRange}
            />
        </Box>
    </Box>)
}

export default TraceDetail