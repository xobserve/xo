// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import MeasurableNode from './MeasurableNode'
import { isSamePropSetter } from './utils'
export default class MeasurableNodes extends React.Component {
  shouldComponentUpdate(np) {
    const p = this.props
    return (
      p.renderNode !== np.renderNode ||
      p.getClassName !== np.getClassName ||
      p.layerType !== np.layerType ||
      p.layoutVertices !== np.layoutVertices ||
      p.nodeRefs !== np.nodeRefs ||
      p.renderUtils !== np.renderUtils ||
      p.vertices !== np.vertices ||
      !isSamePropSetter(p.setOnNode, np.setOnNode)
    )
  }
  render() {
    const {
      getClassName,
      nodeRefs,
      layoutVertices,
      renderUtils,
      vertices,
      layerType,
      renderNode,
      setOnNode,
    } = this.props
    return vertices.map((vertex, i) =>
      /*#__PURE__*/ React.createElement(MeasurableNode, {
        key: vertex.key,
        getClassName: getClassName,
        ref: nodeRefs[i],
        hidden: !layoutVertices,
        layerType: layerType,
        renderNode: renderNode,
        renderUtils: renderUtils,
        vertex: vertex,
        layoutVertex: layoutVertices && layoutVertices[i],
        setOnNode: setOnNode,
      }),
    )
  }
}
