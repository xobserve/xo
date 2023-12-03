// Copyright (c) 2018-2020 The Jaeger Authors.
//

import { TEdge } from '../../components/plexus/lib/types'

import { NodeID } from './types'
import TDagNode from './types/TDagNode'
import TDagPlexusVertex from './types/TDagPlexusVertex'

export default function convPlexus<T extends { [k: string]: unknown }>(
  nodesMap: Map<NodeID, TDagNode<T>>,
) {
  const vertices: TDagPlexusVertex<T>[] = []
  const edges: TEdge[] = []
  const nodes = [...nodesMap.values()]
  for (let i = 0; i < nodes.length; i++) {
    const dagNode = nodes[i]
    vertices.push({
      key: dagNode.id,
      data: dagNode,
    })
    if (!dagNode.parentID) {
      continue
    }
    edges.push({
      from: dagNode.parentID,
      to: dagNode.id,
    })
  }
  return { edges, vertices }
}
