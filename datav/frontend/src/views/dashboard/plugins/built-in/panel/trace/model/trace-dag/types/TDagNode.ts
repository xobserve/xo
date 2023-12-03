// Copyright (c) 2020 The Jaeger Authors.
//

import { NodeID } from './index'

type TDagNode<TData extends { [k: string]: unknown } = {}> = TData & {
  parentID: NodeID | null
  id: NodeID
  children: Set<NodeID>
}

// eslint-disable-next-line no-undef
export default TDagNode
