// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'

import EdgePath from './EdgePath'

import { TPropsFactoryFn } from '../types'
import { TEdge, TLayoutEdge } from '../../types'

type TProps = {
  arrowIriRef: string
  layoutEdges: TLayoutEdge[]
  setOnEdgePath?: TPropsFactoryFn<TEdge> | null
}

export default class PureEdges extends React.PureComponent<TProps> {
  render() {
    const { arrowIriRef, layoutEdges, setOnEdgePath } = this.props
    return layoutEdges.map((edge) => (
      <EdgePath
        key={`${edge.edge.from}\v${edge.edge.to}`}
        pathPoints={edge.pathPoints}
        markerEnd={arrowIriRef}
        {...(setOnEdgePath && setOnEdgePath(edge.edge))}
      />
    ))
  }
}
