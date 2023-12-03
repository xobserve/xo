// Copyright (c) 2019-2020 The Jaeger Authors.
//

import { TEdge } from '../../plexus/lib/types'

import { TDenseSpanMembers } from '../../../model/trace-dag/types'
import TDagPlexusVertex from '../../../model/trace-dag/types/TDagPlexusVertex'

export type TSumSpan = {
  count: number
  errors: number
  percent: number
  percentSelfTime: number
  selfTime: number
  time: number
}

export type TEv = {
  edges: TEdge<{ followsFrom: boolean }>[]
  vertices: TDagPlexusVertex<TSumSpan & TDenseSpanMembers>[]
}
