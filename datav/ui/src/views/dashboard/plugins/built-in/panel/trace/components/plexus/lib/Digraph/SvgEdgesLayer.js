// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import SvgEdges from './SvgEdges'
import SvgLayer from './SvgLayer'
// Add the default black stroke on an outter <g> so CSS classes or styles
// on the inner <g> can override it
// TODO: A more configurable appraoch to setting a default stroke color
const INHERIT_STROKE = {
  stroke: '#000',
}
export default class SvgEdgesLayer extends React.PureComponent {
  render() {
    const { getClassName, graphState, markerEndId, markerStartId, setOnEdge } =
      this.props
    const { layoutEdges, renderUtils } = graphState
    if (!layoutEdges) {
      return null
    }
    return /*#__PURE__*/ React.createElement(
      SvgLayer,
      Object.assign({}, this.props, {
        classNamePart: 'SvgEdgesLayer',
        extraWrapper: INHERIT_STROKE,
      }),
      /*#__PURE__*/ React.createElement(SvgEdges, {
        getClassName: getClassName,
        layoutEdges: layoutEdges,
        markerEndId: markerEndId,
        markerStartId: markerStartId,
        renderUtils: renderUtils,
        setOnEdge: setOnEdge,
      }),
    )
  }
}
