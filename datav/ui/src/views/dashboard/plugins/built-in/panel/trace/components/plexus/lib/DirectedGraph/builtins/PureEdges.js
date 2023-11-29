// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'
import EdgePath from './EdgePath'
export default class PureEdges extends React.PureComponent {
  render() {
    const { arrowIriRef, layoutEdges, setOnEdgePath } = this.props
    return layoutEdges.map((edge) =>
      /*#__PURE__*/ React.createElement(
        EdgePath,
        Object.assign(
          {
            key: `${edge.edge.from}\v${edge.edge.to}`,
            pathPoints: edge.pathPoints,
            markerEnd: arrowIriRef,
          },
          setOnEdgePath && setOnEdgePath(edge.edge),
        ),
      ),
    )
  }
}
