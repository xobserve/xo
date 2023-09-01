import { IViewRangeTime, TUpdateViewRangeTimeFunction, ViewRangeTimeUpdate } from "../../../../types/types";
import TimelineRow from "../TimelineRow";
import TimelineCollapser from "./TimelineCollapser";
import Ticks from "../Ticks";
import VerticalResizer from "components/VerticalResizer/VerticalResizer";
import TimelineViewingLayer from "./TimelineLayer";
import React from "react";
import './TimelineHeader.css'
import { Text, useMediaQuery } from "@chakra-ui/react";
import { MobileBreakpoint } from "src/data/constants";

interface Props {
    duration: number;
    nameColumnWidth: number;
    onCollapseAll: () => void;
    onCollapseOne: () => void;
    onColummWidthChange: (width: number) => void;
    onExpandAll: () => void;
    onExpandOne: () => void;
    updateNextViewRangeTime: (update: ViewRangeTimeUpdate) => void;
    updateViewRangeTime: TUpdateViewRangeTimeFunction;
    viewRangeTime: IViewRangeTime;
}

const NUM_TICKS = 5;

const TimelineHeader = ({ duration, nameColumnWidth, onCollapseAll, onCollapseOne, onColummWidthChange, onExpandAll, onExpandOne, updateNextViewRangeTime, updateViewRangeTime, viewRangeTime }: Props) => {
    const [viewStart, viewEnd] = viewRangeTime.current;
    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    console.log("here3333333 large",isLargeScreen)
    return (<TimelineRow className="TimelineHeaderRow bordered-bottom">
        <TimelineRow.Cell className="ub-flex ub-px2" width={nameColumnWidth} style={{display: "flex",paddingLeft: '0.5rem',paddingRight: '1.5rem'}}>
            <Text fontSize={isLargeScreen ? "md" : "xs"} mr="2">Service &amp; Operation</Text>
            <TimelineCollapser
                onCollapseAll={onCollapseAll}
                onExpandAll={onExpandAll}
                onCollapseOne={onCollapseOne}
                onExpandOne={onExpandOne}
            />
        </TimelineRow.Cell>
        <TimelineRow.Cell width={1 - nameColumnWidth}>
            <TimelineViewingLayer
                boundsInvalidator={nameColumnWidth}
                updateNextViewRangeTime={updateNextViewRangeTime}
                updateViewRangeTime={updateViewRangeTime}
                viewRangeTime={viewRangeTime}
            />
            <Ticks numTicks={NUM_TICKS} startTime={viewStart * duration} endTime={viewEnd * duration} showLabels />
        </TimelineRow.Cell>
        <VerticalResizer position={nameColumnWidth} onChange={onColummWidthChange} min={0.15} max={0.85} />
    </TimelineRow>)
}

export default TimelineHeader
