// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';
import memoizeOne from 'memoize-one';

import CanvasSpanGraph from './CanvasSpanGraph';
import TickLabels from './TickLabels';
import ViewingLayer from './ViewingLayer';
import { TUpdateViewRangeTimeFunction, IViewRange, ViewRangeTimeUpdate } from '../../../types/types';
import { Trace, TraceSpan } from 'types/plugins/trace';
import { useColorModeValue } from '@chakra-ui/react';
import customColors from 'src/theme/colors';



const DEFAULT_HEIGHT = 60;
const TIMELINE_TICK_INTERVAL = 4;

type SpanGraphProps = {
  height?: number;
  trace: Trace;
  viewRange: IViewRange;
  updateViewRangeTime: TUpdateViewRangeTimeFunction;
  updateNextViewRangeTime: (nextUpdate: ViewRangeTimeUpdate) => void;
};

type SpanItem = {
  valueOffset: number;
  valueWidth: number;
  serviceName: string;
};

function getItem(span: TraceSpan): SpanItem {
  return {
    valueOffset: span.relativeStartTime,
    valueWidth: span.duration,
    serviceName: span.process.serviceName,
  };
}

function getItems(trace: Trace): SpanItem[] {
  return trace.spans.map(getItem);
}

const memoizedGetItems = memoizeOne(getItems);

const SpanGraph = (props: SpanGraphProps) => {
  const { height, trace, viewRange, updateNextViewRangeTime, updateViewRangeTime } = props;
  if (!trace) {
    return <div />;
  }

  const items = memoizedGetItems(trace);
  return (
    <div className="ub-pb2 ub-px2">
      <TickLabels numTicks={TIMELINE_TICK_INTERVAL} duration={trace.duration} />
      <div className="ub-relative">
        <CanvasSpanGraph valueWidth={trace.duration} items={items} bg={useColorModeValue(customColors.bodyBg.light,customColors.bodyBg.dark)} />
        <ViewingLayer
          viewRange={viewRange}
          numTicks={TIMELINE_TICK_INTERVAL}
          height={height ?? DEFAULT_HEIGHT}
          updateViewRangeTime={updateViewRangeTime}
          updateNextViewRangeTime={updateNextViewRangeTime}
        />
      </div>
    </div>
  );
}

export default SpanGraph
