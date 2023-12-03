// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import NodesLayer from './NodesLayer'
import SvgEdgesLayer from './SvgEdgesLayer'
import SvgLayer from './SvgLayer'
import { ELayerType } from './types'
export default class SvgLayersGroup extends React.PureComponent {
  renderLayers() {
    const { getClassName, layers, graphState } = this.props
    return layers.map((layer) => {
      const { key, setOnContainer } = layer
      if (layer.edges) {
        return /*#__PURE__*/ React.createElement(SvgEdgesLayer, {
          key: key,
          getClassName: getClassName,
          graphState: graphState,
          markerEndId: layer.markerEndId,
          markerStartId: layer.markerStartId,
          setOnContainer: setOnContainer,
          setOnEdge: layer.setOnEdge,
        })
      }
      if (layer.measurable) {
        // meassurable nodes layer
        throw new Error('Not implemented')
      }
      return /*#__PURE__*/ React.createElement(NodesLayer, {
        key: key,
        getClassName: getClassName,
        graphState: graphState,
        layerType: ELayerType.Svg,
        renderNode: layer.renderNode,
        setOnContainer: setOnContainer,
        setOnNode: layer.setOnNode,
      })
    })
  }
  render() {
    return /*#__PURE__*/ React.createElement(
      SvgLayer,
      Object.assign(
        {
          topLayer: true,
        },
        this.props,
        {
          classNamePart: 'SvgLayersGroup',
        },
      ),
      this.renderLayers(),
    )
  }
}
