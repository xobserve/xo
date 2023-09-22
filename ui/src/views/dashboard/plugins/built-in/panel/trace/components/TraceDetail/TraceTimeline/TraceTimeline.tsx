import { Trace, TraceSpan } from "types/plugins/trace"
import { TNil } from "../../../types/misc";
import { IViewRange, TUpdateViewRangeTimeFunction, ViewRangeTimeUpdate } from "../../../types/types";
import { useCallback, useState } from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import TimelineHeader from "./Header/TimelineHeader";
import SpanRows from './SpanRows'
import customColors from "src/theme/colors";
import React from "react";

interface Props {
  registerAccessors: any
  findMatchesIDs: Set<string> | TNil;
  scrollToFirstVisibleSpan: () => void;
  trace: Trace;
  updateNextViewRangeTime: (update: ViewRangeTimeUpdate) => void;
  updateViewRangeTime: TUpdateViewRangeTimeFunction;
  viewRange: IViewRange;
  search: string
}

const TraceTimeline = ({ trace, updateNextViewRangeTime, updateViewRangeTime, viewRange, registerAccessors, scrollToFirstVisibleSpan, findMatchesIDs, search }: Props) => {
  const [spanNameWidth, setSpanNameWidth] = useState(0.3)
  const [childrenHiddenIDs, setChildrenHiddenIDs] = useState<Set<string>>(new Set())

  const collapseAll = () => {
    if (shouldDisableCollapse(trace.spans, childrenHiddenIDs)) {
      return
    }
    const ids = trace.spans.reduce((res, s) => {
      if (s.hasChildren) {
        res.add(s.spanID);
      }
      return res;
    }, new Set<string>());

    setChildrenHiddenIDs(ids)
  }

  const collapseOne = () => {
    if (shouldDisableCollapse(trace.spans, childrenHiddenIDs)) {
      return
    }
    let nearestCollapsedAncestor: TraceSpan | undefined;
    const ids = trace.spans.reduce((res, curSpan) => {
      if (nearestCollapsedAncestor && curSpan.depth <= nearestCollapsedAncestor.depth) {
        res.add(nearestCollapsedAncestor.spanID);
        if (curSpan.hasChildren) {
          nearestCollapsedAncestor = curSpan;
        }
      } else if (curSpan.hasChildren && !res.has(curSpan.spanID)) {
        nearestCollapsedAncestor = curSpan;
      }
      return res;
    }, new Set(childrenHiddenIDs));
    // The last one
    if (nearestCollapsedAncestor) {
      ids.add(nearestCollapsedAncestor.spanID);
    }

    setChildrenHiddenIDs(ids)
  }

  const expandAll = () => {
    const childrenHiddenIDs = new Set<string>();
    setChildrenHiddenIDs(childrenHiddenIDs)
  }
  const expandOne = () => {
    if (childrenHiddenIDs.size === 0) {
      return;
    }
    let prevExpandedDepth = -1;
    let expandNextHiddenSpan = true;
    const ids = trace.spans.reduce((res, s) => {
      if (s.depth <= prevExpandedDepth) {
        expandNextHiddenSpan = true;
      }
      if (expandNextHiddenSpan && res.has(s.spanID)) {
        res.delete(s.spanID);
        expandNextHiddenSpan = false;
        prevExpandedDepth = s.depth;
      }
      return res;
    }, new Set(childrenHiddenIDs));
    setChildrenHiddenIDs(ids)
  }

  const onChildrenToggle = useCallback(ids => {
    setChildrenHiddenIDs(ids)
  }, [])

  return (<>
    <Box sx={{
      '.TimelineHeaderRow': {
        background: useColorModeValue('#fff', customColors.bodyBg.dark)
      }
    }}>

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
    </Box>
    <SpanRows
      trace={trace}
      registerAccessors={registerAccessors}
      scrollToFirstVisibleSpan={scrollToFirstVisibleSpan}
      findMatchesIDs={findMatchesIDs}
      currentViewRangeTime={viewRange.time.current}
      spanNameWidth={spanNameWidth}
      search={search}
      childrenHiddenIDs={childrenHiddenIDs}
      onChildrenToggle={onChildrenToggle}
    />
  </>)
}

export default TraceTimeline

function shouldDisableCollapse(allSpans: TraceSpan[], hiddenSpansIds: Set<string>) {
  const allParentSpans = allSpans.filter(s => s.hasChildren);
  return allParentSpans.length === hiddenSpansIds.size;
}
