// Copyright (c) 2020 The Jaeger Authors.
//

import { TDenseSpan, NodeID } from './types'

export type TIdFactory = (
  denseSpan: TDenseSpan,
  parentID: NodeID | null,
) => NodeID

export function ancestralPathParentOrLeaf(
  denseSpan: TDenseSpan,
  parentID: NodeID | null,
): NodeID {
  const { children, operation, service } = denseSpan
  const name = `${service}\t${operation}${children.size ? '' : '\t__LEAF__'}`
  return parentID ? `${parentID}\v${name}` : name
}
