// Copyright (c) 2019 Uber Technologies, Inc.
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

import { TEdge, TLayoutEdge, TLayoutVertex, TSizeVertex } from '../types';

const makeEdgeId = (edge: TEdge<any>) => `${edge.from}\v${edge.to}`;

function unmapVertices<T>(
  idToVertex: Map<string, TSizeVertex<any>>,
  output: TLayoutVertex<{}>[]
): TLayoutVertex<T>[] {
  return output.map(lv => {
    const sv = idToVertex.get(lv.vertex.key);
    if (!sv) {
      throw new Error(`Unable to find Vertex for ${lv.vertex.key}`);
    }
    return { ...lv, vertex: sv.vertex };
  });
}

function unmapEdges<T = Record<string, unknown>>(
  idsToEdge: Map<string, TEdge<any>>,
  output: TLayoutEdge<{}>[]
): TLayoutEdge<T>[] {
  return output.map(le => {
    const id = makeEdgeId(le.edge);
    const edge = idsToEdge.get(id);
    if (!edge) {
      throw new Error(`Unable to find edge for ${id}`);
    }
    return { ...le, edge };
  });
}

export default function convInputs(srcEdges: TEdge<any>[], inVertices: TSizeVertex<any>[]) {
  const keyToId = new Map<string, string>();
  const idToVertex = new Map<string, TSizeVertex<any>>();
  const idsToEdge = new Map<string, TEdge<any>>();
  const vertices = inVertices.map(v => {
    const {
      vertex: { key },
      ...rest
    } = v;
    if (keyToId.has(key)) {
      throw new Error(`Non-unique vertex key: ${key}`);
    }
    const id = String(keyToId.size);
    keyToId.set(key, id);
    idToVertex.set(id, v);
    return { vertex: { key: id }, ...rest };
  });
  const edges = srcEdges.map(e => {
    const { from, to, isBidirectional } = e;
    const fromId = keyToId.get(from);
    const toId = keyToId.get(to);
    if (fromId == null) {
      throw new Error(`Unrecognized key on edge, from: ${from}`);
    }
    if (toId == null) {
      throw new Error(`Unrecognized key on edge, to: ${to}`);
    }
    const edge = {
      isBidirectional,
      from: fromId,
      to: toId,
    };
    idsToEdge.set(makeEdgeId(edge), e);
    return edge;
  });
  return {
    edges,
    vertices,
    unmapEdges: unmapEdges.bind(null, idsToEdge),
    unmapVertices: unmapVertices.bind(null, idToVertex),
  };
}
