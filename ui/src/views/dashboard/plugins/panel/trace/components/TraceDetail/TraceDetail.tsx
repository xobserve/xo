import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react"
import { Trace } from "types/plugins/trace"
import TraceDetailHeader from "./TraceHeader"

import ScrollManager from './scroll/scrollManager';
import { useMemo, useState } from "react";
import { ETraceViewType, IViewRange, ViewRangeTimeUpdate } from "../../types/types";
import TraceTimeline from "./TraceTimeline/TraceTimeline";
import customColors from "src/theme/colors";
import { getUiFindVertexKeys } from "../TraceCompare/utils";
import { get, memoize } from "lodash";
import filterSpans from "../../utils/filter-spans";
import calculateTraceDagEV from "./TraceGraph/calculateTraceDageEV";

interface Props {
    trace: Trace
    scrollManager: ScrollManager
}
const TraceDetail = ({ trace, scrollManager }: Props) => {
    const [viewType, setViewType] = useState<ETraceViewType>(ETraceViewType.TraceTimelineViewer)
    const [viewRange, setViewRange] = useState<IViewRange>({
        time: {
            current: [0, 1],
        },
    })
    const [collapsed, setCollapsed] = useState(true)
    const [search, setSearch] = useState("")
    const updateNextViewRangeTime = (update: ViewRangeTimeUpdate) => {
        const time = { ...viewRange.time, ...update };
        setViewRange({ ...viewRange, time });
    };

    const updateViewRangeTime = (start: number, end: number, trackSrc?: string) => {
        const current: [number, number] = [start, end];
        const time = { current };
        setViewRange({ ...viewRange, time })
    };

    const _filterSpans = memoize(
        filterSpans,
        // Do not use the memo if the filter text or trace has changed.
        // trace.data.spans is populated after the initial render via mutation.
        textFilter =>
            `${textFilter} ${trace.traceID} ${trace.spans.length}`
    );

    const traceDagEV = useMemo(() => calculateTraceDagEV(trace), [trace])
    let findCount = 0;
    let spanFindMatches: Set<string> | null | undefined;
    if (search) {
        if (viewType === ETraceViewType.TraceGraph) {
            spanFindMatches = getUiFindVertexKeys(search, get(traceDagEV, 'vertices', []));
            findCount = spanFindMatches ? spanFindMatches.size : 0;
        } else {
            spanFindMatches = _filterSpans(search, trace.spans);
            findCount = spanFindMatches ? spanFindMatches.size : 0;
        }
    }

    console.log("here33333:",findCount, spanFindMatches)
    return (<Box maxHeight="100vh" overflowY="scroll">
        <Box position="fixed" width="100%" bg={useColorModeValue('#fff', customColors.bodyBg.dark)} zIndex="1000">
            <TraceDetailHeader trace={trace} viewRange={viewRange} updateNextViewRangeTime={updateNextViewRangeTime} updateViewRangeTime={updateViewRangeTime} onGraphCollapsed={() => setCollapsed(!collapsed)} collapsed={collapsed} search={search} onSearchChange={setSearch} searchCount={findCount} />
        </Box>
        <Box mt={collapsed ? "67px" : "144px"}>
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