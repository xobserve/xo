// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import { assignMergeCss, getProps, getValueScaler } from './utils'
const getMarkerScale = getValueScaler({
  factorMax: 1,
  factorMin: 0.1,
  valueMax: 2,
  valueMin: 6,
})
function renderDefaultMarker(graphState, entryProps, id) {
  const scale = getMarkerScale(graphState.zoomTransform.k)
  return /*#__PURE__*/ React.createElement(
    'marker',
    Object.assign(
      {
        id: id,
        markerHeight: scale * 8,
        markerUnits: 'userSpaceOnUse',
        markerWidth: scale * 8,
        orient: 'auto',
        refX: scale * 8,
        refY: scale * 3,
      },
      entryProps,
    ),
    /*#__PURE__*/ React.createElement('path', {
      d: `M0,0 L0,${scale * 6} L${scale * 9},${scale * 3} z`,
    }),
  )
}
export default class SvgDefEntry extends React.PureComponent {
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
