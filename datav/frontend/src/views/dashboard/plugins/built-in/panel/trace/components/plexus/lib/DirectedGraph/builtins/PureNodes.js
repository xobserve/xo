// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'
import Node from './Node'
export default class PureNodes extends React.PureComponent {
  _renderVertices() {
    const { classNamePrefix, getNodeLabel, setOnNode, vertices, vertexRefs } =
      this.props
    return vertices.map((v, i) =>
      /*#__PURE__*/ React.createElement(
        Node,
        Object.assign(
          {
            key: v.key,
            ref: vertexRefs[i],
            hidden: true,
            classNamePrefix: classNamePrefix,
            labelFactory: getNodeLabel,
            vertex: v,
          },
          setOnNode && setOnNode(v),
        ),
      ),
    )
  }
  _renderLayoutVertices() {
    const {
      classNamePrefix,
      getNodeLabel,
      setOnNode,
      layoutVertices,
      vertexRefs,
    } = this.props
    if (!layoutVertices) {
      return null
    }
    return layoutVertices.map((lv, i) =>
      /*#__PURE__*/ React.createElement(
        Node,
        Object.assign(
          {
            key: lv.vertex.key,
            ref: vertexRefs[i],
            classNamePrefix: classNamePrefix,
            labelFactory: getNodeLabel,
            vertex: lv.vertex,
            left: lv.left,
            top: lv.top,
          },
          setOnNode && setOnNode(lv.vertex),
        ),
      ),
    )
  }
  render() {
    if (this.props.layoutVertices) {
      return this._renderLayoutVertices()
    }
    return this._renderVertices()
  }
}
