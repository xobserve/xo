// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'
const id = 'edgeArrow'
export const iriRef = `url(#${id})`
export const arrowDef = /*#__PURE__*/ React.createElement(
  'marker',
  {
    id: id,
    markerWidth: '8',
    markerHeight: '8',
    refX: '8',
    refY: '3',
    orient: 'auto',
    markerUnits: 'strokeWidth',
  },
  /*#__PURE__*/ React.createElement('path', {
    d: 'M0,0 L0,6 L9,3 z',
    fill: '#000',
  }),
)
export const defs = /*#__PURE__*/ React.createElement('defs', null, arrowDef)
