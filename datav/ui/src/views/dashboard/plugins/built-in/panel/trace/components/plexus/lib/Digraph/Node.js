// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import { ELayerType } from './types'
import { assignMergeCss, getProps } from './utils'
function getHtmlStyle(lv) {
  const { height, left, top, width } = lv
  return {
    height,
    width,
    position: 'absolute',
    transform:
      left == null || top == null
        ? undefined
        : `translate(${left.toFixed()}px,${top.toFixed()}px)`,
  }
}
export default class Node extends React.PureComponent {
  render() {
    const {
      getClassName,
      layerType,
      renderNode,
      renderUtils,
      setOnNode,
      layoutVertex,
    } = this.props
    const nodeContent = renderNode(layoutVertex, renderUtils)
    if (!nodeContent) {
      return null
    }
    const { left, top } = layoutVertex
    const props = assignMergeCss(
      {
        className: getClassName('Node'),
        style:
          layerType === ELayerType.Html ? getHtmlStyle(layoutVertex) : null,
        transform:
          layerType === ELayerType.Svg
            ? `translate(${left.toFixed()},${top.toFixed()})`
            : null,
      },
      getProps(setOnNode, layoutVertex, renderUtils),
    )
    const Wrapper = layerType === ELayerType.Html ? 'div' : 'g'
    return /*#__PURE__*/ React.createElement(Wrapper, props, nodeContent)
  }
}
