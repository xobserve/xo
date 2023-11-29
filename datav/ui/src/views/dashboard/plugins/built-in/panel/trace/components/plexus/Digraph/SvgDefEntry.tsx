// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'

import {
  TFromGraphStateFn,
  TAnyProps,
  TSetProps,
  TExposedGraphState,
} from './types'
import { assignMergeCss, getProps, getValueScaler } from './utils'

type TProps<T = {}, U = {}> = {
  getClassName: (name: string) => string
  graphState: TExposedGraphState<T, U>
  localId: string
  renderEntry?: (
    graphState: TExposedGraphState<T, U>,
    entryProps: TAnyProps | null,
    id: string,
  ) => React.ReactElement
  setOnEntry?: TSetProps<TFromGraphStateFn<T, U>>
}

const getMarkerScale = getValueScaler({
  factorMax: 1,
  factorMin: 0.1,
  valueMax: 2,
  valueMin: 6,
})

function renderDefaultMarker(
  graphState: TExposedGraphState<any, any>,
  entryProps: TAnyProps | null,
  id: string,
) {
  const scale = getMarkerScale(graphState.zoomTransform.k)
  return (
    <marker
      id={id}
      markerHeight={scale * 8}
      markerUnits='userSpaceOnUse'
      markerWidth={scale * 8}
      orient='auto'
      refX={scale * 8}
      refY={scale * 3}
      {...entryProps}
    >
      <path d={`M0,0 L0,${scale * 6} L${scale * 9},${scale * 3} z`} />
    </marker>
  )
}

export default class SvgDefEntry<T = {}, U = {}> extends React.PureComponent<
  TProps<T, U>
> {
  render() {
    const {
      getClassName,
      localId,
      graphState,
      renderEntry = renderDefaultMarker,
      setOnEntry,
    } = this.props
    const id = graphState.renderUtils.getGlobalId(localId)
    const entryProps = assignMergeCss(
      {
        className: getClassName('DefEntry'),
      },
      getProps(setOnEntry, graphState),
    )
    return renderEntry(graphState, entryProps, id)
  }
}
