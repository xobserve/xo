// Copyright (c) 2017 Uber Technologies, Inc.
//

import { TNil } from './misc'

interface ITimeCursorUpdate {
  cursor: number | TNil
}

interface ITimeReframeUpdate {
  reframe: {
    anchor: number
    shift: number
  }
}

interface ITimeShiftEndUpdate {
  shiftEnd: number
}

interface ITimeShiftStartUpdate {
  shiftStart: number
}

export type TUpdateViewRangeTimeFunction = (
  start: number,
  end: number,
  trackSrc?: string,
) => void

export type ViewRangeTimeUpdate =
  | ITimeCursorUpdate
  | ITimeReframeUpdate
  | ITimeShiftEndUpdate
  | ITimeShiftStartUpdate

export interface IViewRangeTime {
  current: [number, number]
  cursor?: number | TNil
  reframe?: {
    anchor: number
    shift: number
  }
  shiftEnd?: number
  shiftStart?: number
}

export interface IViewRange {
  time: IViewRangeTime
}

export enum ETraceViewType {
  TraceTimelineViewer = 'TimelineViewer',
  TraceGraph = 'NodeGraph',
  TraceStatistics = 'Statistics',
  TraceSpansView = 'SpansView',
  TraceFlamegraph = 'FlameGraph',
  TraceJSON = 'JSON',
}
