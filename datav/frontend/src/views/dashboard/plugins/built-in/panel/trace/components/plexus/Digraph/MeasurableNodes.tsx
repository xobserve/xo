// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'

import MeasurableNode from './MeasurableNode'
import { TMeasurableNodeRenderer, TLayerType, TRendererUtils } from './types'
import { isSamePropSetter } from './utils'
import { TLayoutVertex, TVertex } from '../types'

type TProps<T = {}> = Omit<
  TMeasurableNodeRenderer<T>,
  'measurable' | 'measureNode'
> & {
  getClassName: (name: string) => string
  layerType: TLayerType
  layoutVertices: TLayoutVertex<T>[] | null
  nodeRefs: React.RefObject<MeasurableNode<T>>[]
  renderUtils: TRendererUtils
  vertices: TVertex<T>[]
}

export default class MeasurableNodes<T = {}> extends React.Component<
  TProps<T>
> {
  shouldComponentUpdate(np: TProps<T>) {
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
    return vertices.map((vertex, i) => (
      <MeasurableNode<T>
        key={vertex.key}
        getClassName={getClassName}
        ref={nodeRefs[i]}
        hidden={!layoutVertices}
        layerType={layerType}
        renderNode={renderNode}
        renderUtils={renderUtils}
        vertex={vertex}
        layoutVertex={layoutVertices && layoutVertices[i]}
        setOnNode={setOnNode}
      />
    ))
  }
}
