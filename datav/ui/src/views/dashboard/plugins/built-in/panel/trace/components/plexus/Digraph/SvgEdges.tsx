// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'

import SvgEdge from './SvgEdge'
import { TRendererUtils, TSetProps, TAnyProps } from './types'
import { TLayoutEdge } from '../types'
import { isSamePropSetter } from './utils'

type TProps<T = {}> = {
  getClassName: (name: string) => string
  layoutEdges: TLayoutEdge<T>[]
  markerEndId?: string
  markerStartId?: string
  renderUtils: TRendererUtils
  setOnEdge?: TSetProps<
    (edge: TLayoutEdge<T>, utils: TRendererUtils) => TAnyProps | null
  >
}

export default class SvgEdges<T = {}> extends React.Component<TProps<T>> {
  shouldComponentUpdate(np: TProps<T>) {
    const p = this.props
    return (
      p.getClassName !== np.getClassName ||
      p.layoutEdges !== np.layoutEdges ||
      p.markerEndId !== np.markerEndId ||
      p.markerStartId !== np.markerStartId ||
      p.renderUtils !== np.renderUtils ||
      !isSamePropSetter(p.setOnEdge, np.setOnEdge)
    )
  }

  render() {
    const {
      getClassName,
      layoutEdges,
      markerEndId,
      markerStartId,
      renderUtils,
      setOnEdge,
    } = this.props
    return layoutEdges.map((edge) => (
      <SvgEdge
        key={`${edge.edge.from}\v${edge.edge.to}`}
        getClassName={getClassName}
        layoutEdge={edge}
        markerEndId={markerEndId}
        markerStartId={markerStartId}
        renderUtils={renderUtils}
        setOnEdge={setOnEdge}
      />
    ))
  }
}
