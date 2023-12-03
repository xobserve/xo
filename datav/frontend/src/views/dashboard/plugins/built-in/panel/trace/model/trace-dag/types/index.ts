// Copyright (c) 2018-2020 The Jaeger Authors.
//

import { TraceSpan } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'
import { TNil } from '../../../types/misc'

export type NodeID = string

export type TDenseSpan = {
  span: TraceSpan
  id: string
  service: string
  operation: string
  tags: Record<string, any>
  parentID: string | TNil
  skipToChild: boolean
  children: Set<string>
}

export type TDenseSpanMembers = {
  members: TDenseSpan[]
  operation: string
  service: string
}

export type TDiffCounts = TDenseSpanMembers & {
  a: TDenseSpan[] | null
  b: TDenseSpan[] | null
}
