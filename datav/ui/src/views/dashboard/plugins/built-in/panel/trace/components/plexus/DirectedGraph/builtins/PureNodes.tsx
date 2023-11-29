// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'

import Node from './Node'

import { TPropsFactoryFn } from '../types'
import { TLayoutVertex, TVertex } from '../../types'

type TProps<T> = {
  classNamePrefix?: string | null
  getNodeLabel: ((vertex: TVertex<T>) => React.ReactNode) | null
  layoutVertices: TLayoutVertex[] | null
  setOnNode?: TPropsFactoryFn<TVertex> | null
  vertexRefs: { current: HTMLElement | null }[]
  vertices: TVertex[]
}

export default class PureNodes<T> extends React.PureComponent<TProps<T>> {
  _renderVertices() {
    const { classNamePrefix, getNodeLabel, setOnNode, vertices, vertexRefs } =
      this.props
    return vertices.map((v, i) => (
      <Node
        key={v.key}
        ref={vertexRefs[i]}
        hidden
        classNamePrefix={classNamePrefix}
        labelFactory={getNodeLabel}
        vertex={v}
        {...(setOnNode && setOnNode(v))}
      />
    ))
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
    return layoutVertices.map((lv, i) => (
      <Node
        key={lv.vertex.key}
        ref={vertexRefs[i]}
        classNamePrefix={classNamePrefix}
        labelFactory={getNodeLabel}
        vertex={lv.vertex}
        left={lv.left}
        top={lv.top}
        {...(setOnNode && setOnNode(lv.vertex))}
      />
    ))
  }

  render() {
    if (this.props.layoutVertices) {
      return this._renderLayoutVertices()
    }
    return this._renderVertices()
  }
}
