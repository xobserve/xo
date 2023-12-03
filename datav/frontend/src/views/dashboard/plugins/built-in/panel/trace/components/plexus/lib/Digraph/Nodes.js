// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import Node from './Node'
import { isSamePropSetter } from './utils'
export default class Nodes extends React.Component {
  shouldComponentUpdate(np) {
    const p = this.props
    return (
      p.renderNode !== np.renderNode ||
      p.getClassName !== np.getClassName ||
      p.layerType !== np.layerType ||
      p.layoutVertices !== np.layoutVertices ||
      p.renderUtils !== np.renderUtils ||
      !isSamePropSetter(p.setOnNode, np.setOnNode)
    )
  }
  render() {
    const {
      getClassName,
      layoutVertices,
      renderUtils,
      layerType,
      renderNode,
      setOnNode,
    } = this.props
    return layoutVertices.map((lv) =>
      /*#__PURE__*/ React.createElement(Node, {
        key: lv.vertex.key,
        getClassName: getClassName,
        layerType: layerType,
        layoutVertex: lv,
        renderNode: renderNode,
        renderUtils: renderUtils,
        setOnNode: setOnNode,
      }),
    )
  }
}
