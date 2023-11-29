// Copyright (c) 2017 Uber Technologies, Inc.
//

import {
  TLayoutEdge,
  TLayoutGraph,
  TLayoutVertex,
  TSizeVertex,
} from '../../types'

const round = Math.round

const DPI = 72

export function vertexToDot(v: TSizeVertex): TSizeVertex {
  // expect only width and height for going to dot
  const { vertex, height, width } = v
  return {
    vertex,
    height: height / DPI,
    width: width / DPI,
  }
}

export function edgeToPixels(
  graph: TLayoutGraph,
  e: TLayoutEdge<{}>,
): TLayoutEdge<{}> {
  const { height: h } = graph
  const { edge, pathPoints } = e
  return {
    edge,
    pathPoints:
      pathPoints &&
      pathPoints.map<[number, number]>((pt) => [
        round(pt[0] * DPI),
        round((h - pt[1]) * DPI),
      ]),
  }
}

export function graphToPixels(graph: TLayoutGraph) {
  const { height, scale, width } = graph
  return {
    scale,
    height: height * DPI,
    width: width * DPI,
  }
}

export function vertexToPixels(
  graph: TLayoutGraph,
  v: TLayoutVertex,
): TLayoutVertex {
  const { height: h } = graph
  const { vertex, height, left, top, width } = v
  return {
    vertex,
    height: round(height * DPI),
    left: left != null ? round((left - width * 0.5) * DPI) : left,
    top: top != null ? round((h - top - height * 0.5) * DPI) : top,
    width: round(width * DPI),
  }
}
