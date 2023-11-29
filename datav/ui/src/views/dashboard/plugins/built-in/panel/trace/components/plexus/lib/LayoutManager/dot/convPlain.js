// Copyright (c) 2017 Uber Technologies, Inc.
//

const FLAG_MAPPINGS = {
  bidir: 'isBidirectional',
}
function throwMalformedPlain(str, i) {
  throw new Error(`Malformed plain output: ${str.slice(i - 100, i + 100)}`)
}
function parseString(str, startIndex) {
  const isQuoted = str[startIndex] === '"'
  const i = startIndex + Number(isQuoted)
  const end = str.indexOf(isQuoted ? '"' : ' ', i)
  return {
    value: str.slice(i, end),
    end: end + Number(isQuoted),
  }
}
function parseNumber(str, startIndex) {
  let boundary =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ' '
  const end = str.indexOf(boundary, startIndex)
  if (end < startIndex) {
    throwMalformedPlain(str, startIndex)
  }
  return {
    value: Number(str.slice(startIndex, end)),
    end,
  }
}
function parseNumbers(count, str, startIndex) {
  let boundary =
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ' '
  const values = []
  let ci = startIndex
  let i = count
  while (i--) {
    if (str[ci] === ' ') {
      ci++
    }
    const { value, end } = parseNumber(str, ci, boundary)
    values.push(value)
    ci = end
  }
  return {
    values,
    end: ci,
  }
}
function parseGraph(str, startIndex) {
  // skip "graph "
  const i = startIndex + 6
  const {
    values: [scale, width],
    end: widthEnd,
  } = parseNumbers(2, str, i)
  const { value: height, end } = parseNumber(str, widthEnd + 1, '\n')
  return {
    end,
    graph: {
      height,
      scale,
      width,
    },
  }
}
function parseNode(str, startIndex) {
  // skip "node "
  const i = startIndex + 5
  const { value: key, end: keyEnd } = parseString(str, i)
  const { values, end } = parseNumbers(4, str, keyEnd + 1)
  const [left, top, width, height] = values
  return {
    vertex: {
      vertex: {
        key,
      },
      height,
      left,
      top,
      width,
    },
    end: str.indexOf('\n', end + 1),
  }
}
function parseEdge(str, startIndex) {
  // skip "edge "
  const i = startIndex + 5
  const { value: from, end: fromEnd } = parseString(str, i)
  const { value: to, end: toEnd } = parseString(str, fromEnd + 1)
  const { value: pointCount, end: endPtCount } = parseNumber(str, toEnd + 1)
  const { values: flatPoints, end: pointsEnd } = parseNumbers(
    pointCount * 2,
    str,
    endPtCount + 1,
  )
  const { value: flags, end: flagsEnd } = parseString(str, pointsEnd + 1)
  const pathPoints = []
  for (let pi = 0; pi < flatPoints.length; pi += 2) {
    pathPoints.push([flatPoints[pi], flatPoints[pi + 1]])
  }
  const edgeFlags = {}
  flags.split(',').forEach((flag) => {
    const name = FLAG_MAPPINGS[flag]
    if (name) {
      edgeFlags[name] = true
    }
  })
  return {
    edge: {
      edge: {
        from,
        to,
        ...edgeFlags,
      },
      pathPoints,
    },
    end: str.indexOf('\n', flagsEnd + 1),
  }
}
export default function convPlain(str) {
  let parseEdges =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false
  const edges = []
  const vertices = []
  let i = 0
  const { end: graphEnd, graph } = parseGraph(str, i)
  i = graphEnd + 1
  // stop when the "stop" line is hit
  while (str[i] !== 's') {
    if (str[i] === 'n') {
      const { end, vertex } = parseNode(str, i)
      vertices.push(vertex)
      i = end + 1
      continue
    }
    if (str[i] === 'e') {
      if (!parseEdges) {
        i = str.indexOf('\n', i) + 1
        continue
      }
      const { end, edge } = parseEdge(str, i)
      edges.push(edge)
      i = end + 1
      continue
    }
    throwMalformedPlain(str, i)
  }
  return {
    graph,
    vertices,
    edges: parseEdges ? edges : null,
  }
}
