import { Trace } from "types/plugins/trace"
import { TNil } from "../../../types/misc";
import { IViewRange, TUpdateViewRangeTimeFunction, ViewRangeTimeUpdate } from "../../../types/types";
import { useState } from "react";
import { Box } from "@chakra-ui/react";
import TimelineHeader from "./Header/TimelineHeader";

interface Props {
    registerAccessors: any
    findMatchesIDs: Set<string> | TNil;
    scrollToFirstVisibleSpan: () => void;
    trace: Trace;
    updateNextViewRangeTime: (update: ViewRangeTimeUpdate) => void;
    updateViewRangeTime: TUpdateViewRangeTimeFunction;
    viewRange: IViewRange;
}

const TraceTimeline = ({ trace, updateNextViewRangeTime, updateViewRangeTime, viewRange } : Props) => {
    const [spanNameWidth, setSpanNameWidth] = useState(0.2)
    const collapseAll = () => {
        
    }
    const collapseOne = () => {

    }
    const expandAll = () => {
    }
    const expandOne = () => {
    }
    return (<Box>
        <TimelineHeader
          duration={trace.duration}
          nameColumnWidth={spanNameWidth}
          onCollapseAll={collapseAll}
          onCollapseOne={collapseOne}
          onColummWidthChange={setSpanNameWidth}
          onExpandAll={expandAll}
          onExpandOne={expandOne}
          viewRangeTime={viewRange.time}
          updateNextViewRangeTime={updateNextViewRangeTime}
          updateViewRangeTime={updateViewRangeTime}
        />
    </Box>)
}

export default TraceTimeline