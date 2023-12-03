// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'
export default class EdgeArrowDef extends React.PureComponent {
  static getId(idBase) {
    return `${idBase}--edgeArrow`
  }
  static getIriRef(idBase) {
    return `url(#${EdgeArrowDef.getId(idBase)})`
  }
  render() {
    const { id, scaleDampener, zoomScale = null } = this.props
    const scale = zoomScale != null ? Math.max(scaleDampener / zoomScale, 1) : 1
    return /*#__PURE__*/ React.createElement(
      'defs',
      null,
      /*#__PURE__*/ React.createElement(
        'marker',
        {
          id: id,
          markerHeight: scale * 8,
          markerUnits: 'strokeWidth',
          markerWidth: scale * 8,
          orient: 'auto',
          refX: scale * 8,
          refY: scale * 3,
        },
        /*#__PURE__*/ React.createElement('path', {
          d: `M0,0 L0,${scale * 6} L${scale * 9},${scale * 3} z`,
          fill: '#000',
        }),
      ),
    )
  }
}
EdgeArrowDef.defaultProps = {
  zoomScale: null,
  scaleDampener: 0.6,
}
