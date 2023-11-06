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

import { TLayoutEdge, TLayoutGraph, TLayoutVertex } from '../../types';

const FLAG_MAPPINGS: Record<string, string> = {
  bidir: 'isBidirectional',
};

function throwMalformedPlain(str: string, i: number) {
  throw new Error(`Malformed plain output: ${str.slice(i - 100, i + 100)}`);
}

function parseString(str: string, startIndex: number) {
  const isQuoted = str[startIndex] === '"';
  const i = startIndex + Number(isQuoted);
  const end = str.indexOf(isQuoted ? '"' : ' ', i);
  return {
    value: str.slice(i, end),
    end: end + Number(isQuoted),
  };
}

function parseNumber(
  str: string,
  startIndex: number,
  boundary: string = ' '
): { value: number; end: number } {
  const end = str.indexOf(boundary, startIndex);
  if (end < startIndex) {
    throwMalformedPlain(str, startIndex);
  }
  return {
    value: Number(str.slice(startIndex, end)),
    end,
  };
}

function parseNumbers(
  count: number,
  str: string,
  startIndex: number,
  boundary: string = ' '
): { values: number[]; end: number } {
  const values: number[] = [];
  let ci = startIndex;
  let i = count;
  while (i--) {
    if (str[ci] === ' ') {
      ci++;
    }
    const { value, end } = parseNumber(str, ci, boundary);
    values.push(value);
    ci = end;
  }
  return { values, end: ci };
}

function parseGraph(str: string, startIndex: number): { end: number; graph: TLayoutGraph } {
  // skip "graph "
  const i = startIndex + 6;
  const {
    values: [scale, width],
    end: widthEnd,
  } = parseNumbers(2, str, i);
  const { value: height, end } = parseNumber(str, widthEnd + 1, '\n');
  return {
    end,
    graph: {
      height,
      scale,
      width,
    },
  };
}

function parseNode(str: string, startIndex: number) {
  // skip "node "
  const i = startIndex + 5;
  const { value: key, end: keyEnd } = parseString(str, i);
  const { values, end } = parseNumbers(4, str, keyEnd + 1);
  const [left, top, width, height] = values;
  return {
    vertex: {
      vertex: { key },
      height,
      left,
      top,
      width,
    },
    end: str.indexOf('\n', end + 1),
  };
}

function parseEdge(str: string, startIndex: number) {
  // skip "edge "
  const i = startIndex + 5;
  const { value: from, end: fromEnd } = parseString(str, i);
  const { value: to, end: toEnd } = parseString(str, fromEnd + 1);
  const { value: pointCount, end: endPtCount } = parseNumber(str, toEnd + 1);
  const { values: flatPoints, end: pointsEnd } = parseNumbers(pointCount * 2, str, endPtCount + 1);
  const { value: flags, end: flagsEnd } = parseString(str, pointsEnd + 1);
  const pathPoints: [number, number][] = [];
  for (let pi = 0; pi < flatPoints.length; pi += 2) {
    pathPoints.push([flatPoints[pi], flatPoints[pi + 1]]);
  }
  const edgeFlags: Record<string, boolean> = {};
  flags.split(',').forEach(flag => {
    const name = FLAG_MAPPINGS[flag];
    if (name) {
      edgeFlags[name] = true;
    }
  });
  return {
    edge: {
      edge: { from, to, ...edgeFlags },
      pathPoints,
    },
    end: str.indexOf('\n', flagsEnd + 1),
  };
}

export default function convPlain(str: string, parseEdges: boolean = false) {
  const edges: TLayoutEdge[] = [];
  const vertices: TLayoutVertex[] = [];
  let i = 0;
  const { end: graphEnd, graph } = parseGraph(str, i);
  i = graphEnd + 1;
  // stop when the "stop" line is hit
  while (str[i] !== 's') {
    if (str[i] === 'n') {
      const { end, vertex } = parseNode(str, i);
      vertices.push(vertex);
      i = end + 1;
      continue;
    }
    if (str[i] === 'e') {
      if (!parseEdges) {
        i = str.indexOf('\n', i) + 1;
        continue;
      }
      const { end, edge } = parseEdge(str, i);
      edges.push(edge);
      i = end + 1;
      continue;
    }
    throwMalformedPlain(str, i);
  }
  return { graph, vertices, edges: parseEdges ? edges : null };
}
