// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'

import SvgEdges from './SvgEdges'
import SvgLayer from './SvgLayer'
import { TExposedGraphState, TStandaloneEdgesLayer } from './types'

type TProps<T = {}, U = {}> = Omit<
  TStandaloneEdgesLayer<T, U>,
  'edges' | 'layerType' | 'key'
> & {
  getClassName: (name: string) => string
  graphState: TExposedGraphState<T, U>
  standalone?: boolean
}

// Add the default black stroke on an outter <g> so CSS classes or styles
// on the inner <g> can override it
// TODO: A more configurable appraoch to setting a default stroke color
const INHERIT_STROKE = { stroke: '#000' }

export default class SvgEdgesLayer<T = {}, U = {}> extends React.PureComponent<
  TProps<T, U>
> {
  render() {
    const { getClassName, graphState, markerEndId, markerStartId, setOnEdge } =
      this.props
    const { layoutEdges, renderUtils } = graphState

    if (!layoutEdges) {
      return null
    }

    return (
      <SvgLayer
        {...this.props}
        classNamePart='SvgEdgesLayer'
        extraWrapper={INHERIT_STROKE}
      >
        <SvgEdges
          getClassName={getClassName}
          layoutEdges={layoutEdges}
          markerEndId={markerEndId}
          markerStartId={markerStartId}
          renderUtils={renderUtils}
          setOnEdge={setOnEdge}
        />
      </SvgLayer>
    )
  }
}
