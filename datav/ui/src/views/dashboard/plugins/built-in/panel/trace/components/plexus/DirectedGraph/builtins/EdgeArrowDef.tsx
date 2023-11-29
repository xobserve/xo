// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'

type TProps = {
  id: string
  scaleDampener: number
  zoomScale?: number | null
}

export default class EdgeArrowDef extends React.PureComponent<TProps> {
  static defaultProps = {
    zoomScale: null,
    scaleDampener: 0.6,
  }

  static getId(idBase: string) {
    return `${idBase}--edgeArrow`
  }

  static getIriRef(idBase: string) {
    return `url(#${EdgeArrowDef.getId(idBase)})`
  }

  render() {
    const { id, scaleDampener, zoomScale = null } = this.props
    const scale = zoomScale != null ? Math.max(scaleDampener / zoomScale, 1) : 1
    return (
      <defs>
        <marker
          id={id}
          markerHeight={scale * 8}
          markerUnits='strokeWidth'
          markerWidth={scale * 8}
          orient='auto'
          refX={scale * 8}
          refY={scale * 3}
        >
          <path
            d={`M0,0 L0,${scale * 6} L${scale * 9},${scale * 3} z`}
            fill='#000'
          />
        </marker>
      </defs>
    )
  }
}
