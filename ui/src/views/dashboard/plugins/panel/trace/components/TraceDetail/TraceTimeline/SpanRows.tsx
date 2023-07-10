import { useState } from "react";
import cx from 'classnames';
import { TNil } from "types/misc";
import { Accessors } from "../scroll/scrollManager";
import { Trace, TraceSpan } from "types/plugins/trace";
import DetailState from "./SpanRow/SpanDetail/DetailState";
import memoizeOne from 'memoize-one';
import { createViewedBoundsFunc } from "./utils";
import { isEqual } from "lodash";

interface Props  {
    currentViewRangeTime: [number, number];
    findMatchesIDs: Set<string> | TNil;
    scrollToFirstVisibleSpan: () => void;
    registerAccessors: (accesors: Accessors) => void;
    trace: Trace;
    spanNameWidth: number
  };

const memoizedGenerateRowStates = memoizeOne(generateRowStatesFromTrace);
const memoizedViewBoundsFunc = memoizeOne(createViewedBoundsFunc, isEqual);
const memoizedGetCssClasses = memoizeOne(getCssClasses, isEqual);

const SpanRows = ({trace,currentViewRangeTime,findMatchesIDs,scrollToFirstVisibleSpan,registerAccessors}:Props) => {
    const [hoverIndentIds, setHoverIndentIds] = useState<Set<string>>(new Set());
    function addHoverIndentId(spanID) {
        const newIds = new Set(hoverIndentIds);
        newIds.add(spanID);
        setHoverIndentIds(newIds);
    }
      
      function removeHoverIndentId(spanID) {
        const newIds = new Set(hoverIndentIds);
        newIds.delete(spanID);
      
        setHoverIndentIds(newIds);
      }

      return (<>
      </>)
}

export default SpanRows



type RowState = {
    isDetail: boolean;
    span: TraceSpan;
    spanIndex: number;
  };

export const DEFAULT_HEIGHTS = {
    bar: 28,
    detail: 161,
    detailWithLogs: 197,
  };
  
  const NUM_TICKS = 5;
  
  function generateRowStates(
    spans: TraceSpan[] | TNil,
    childrenHiddenIDs: Set<string>,
    detailStates: Map<string, DetailState | TNil>
  ): RowState[] {
    if (!spans) {
      return [];
    }
    let collapseDepth = null;
    const rowStates = [];
    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      const { spanID, depth } = span;
      let hidden = false;
      if (collapseDepth != null) {
        if (depth >= collapseDepth) {
          hidden = true;
        } else {
          collapseDepth = null;
        }
      }
      if (hidden) {
        continue;
      }
      if (childrenHiddenIDs.has(spanID)) {
        collapseDepth = depth + 1;
      }
      rowStates.push({
        span,
        isDetail: false,
        spanIndex: i,
      });
      if (detailStates.has(spanID)) {
        rowStates.push({
          span,
          isDetail: true,
          spanIndex: i,
        });
      }
    }
    return rowStates;
  }
  
  function generateRowStatesFromTrace(
    trace: Trace | TNil,
    childrenHiddenIDs: Set<string>,
    detailStates: Map<string, DetailState | TNil>
  ): RowState[] {
    return trace ? generateRowStates(trace.spans, childrenHiddenIDs, detailStates) : [];
  }
  
  function getCssClasses(currentViewRange: [number, number]) {
    const [zoomStart, zoomEnd] = currentViewRange;
    return cx({
      'clipping-left': zoomStart > 0,
      'clipping-right': zoomEnd < 1,
    });
  }
  