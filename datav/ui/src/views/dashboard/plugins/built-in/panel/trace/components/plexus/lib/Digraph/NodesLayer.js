// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import HtmlLayer from './HtmlLayer'
import Nodes from './Nodes'
import SvgLayer from './SvgLayer'
import { ELayerType } from './types'
export default class NodesLayer extends React.PureComponent {
  render() {
    const { renderNode } = this.props
    const { layoutVertices, renderUtils } = this.props.graphState
    if (!layoutVertices || !renderNode) {
      return null
    }
    const { getClassName, layerType, setOnNode } = this.props
    const LayerComponent = layerType === ELayerType.Html ? HtmlLayer : SvgLayer
    return /*#__PURE__*/ React.createElement(
      LayerComponent,
      Object.assign({}, this.props, {
        classNamePart: 'NodesLayer',
      }),
      /*#__PURE__*/ React.createElement(Nodes, {
        getClassName: getClassName,
        layerType: layerType,
        layoutVertices: layoutVertices,
        renderNode: renderNode,
        renderUtils: renderUtils,
        setOnNode: setOnNode,
      }),
    )
  }
}
