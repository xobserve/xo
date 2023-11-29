// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'

const id = 'edgeArrow'
export const iriRef = `url(#${id})`

export const arrowDef = (
  <marker
    id={id}
    markerWidth='8'
    markerHeight='8'
    refX='8'
    refY='3'
    orient='auto'
    markerUnits='strokeWidth'
  >
    <path d='M0,0 L0,6 L9,3 z' fill='#000' />
  </marker>
)

export const defs = <defs>{arrowDef}</defs>
