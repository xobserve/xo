// Copyright (c) 2019 Uber Technologies, Inc.
//

const makeEdgeId = (edge) => `${edge.from}\v${edge.to}`
function unmapVertices(idToVertex, output) {
  return output.map((lv) => {
    const sv = idToVertex.get(lv.vertex.key)
    if (!sv) {
      throw new Error(`Unable to find Vertex for ${lv.vertex.key}`)
    }
    return {
      ...lv,
      vertex: sv.vertex,
    }
  })
}
function unmapEdges(idsToEdge, output) {
  return output.map((le) => {
    const id = makeEdgeId(le.edge)
    const edge = idsToEdge.get(id)
    if (!edge) {
      throw new Error(`Unable to find edge for ${id}`)
    }
    return {
      ...le,
      edge,
    }
  })
}
export default function convInputs(srcEdges, inVertices) {
  const keyToId = new Map()
  const idToVertex = new Map()
  const idsToEdge = new Map()
  const vertices = inVertices.map((v) => {
    const {
      vertex: { key },
      ...rest
    } = v
    if (keyToId.has(key)) {
      throw new Error(`Non-unique vertex key: ${key}`)
    }
    const id = String(keyToId.size)
    keyToId.set(key, id)
    idToVertex.set(id, v)
    return {
      vertex: {
        key: id,
      },
      ...rest,
    }
  })
  const edges = srcEdges.map((e) => {
    const { from, to, isBidirectional } = e
    const fromId = keyToId.get(from)
    const toId = keyToId.get(to)
    if (fromId == null) {
      throw new Error(`Unrecognized key on edge, from: ${from}`)
    }
    if (toId == null) {
      throw new Error(`Unrecognized key on edge, to: ${to}`)
    }
    const edge = {
      isBidirectional,
      from: fromId,
      to: toId,
    }
    idsToEdge.set(makeEdgeId(edge), e)
    return edge
  })
  return {
    edges,
    vertices,
    unmapEdges: unmapEdges.bind(null, idsToEdge),
    unmapVertices: unmapVertices.bind(null, idToVertex),
  }
}
